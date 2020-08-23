(function() {
    var Schema = window.Schema || require("schema").Schema
    var Model = window.Model || require("model").Model
    var Collection = window.Collection || require("collection").Collection
    var Activity = window.Activity || require('activity').Activity
    var Profile = window.Profile || require('profile').Profile
    var moment = window.moment || require("moment-timezone")
    var firebase = window.firebase || require("firebase-admin")

    class Player extends Model {
        static defineSchema() {
            var schema = new Schema()

            schema.add("username", String)
            schema.add("experience", String)
            schema.add("startTime", moment, { timezone: "America/Los_Angeles", format: "hh:mma" })
            schema.add("endTime", moment, { timezone: "America/Los_Angeles", format: "hh:mma" })
            schema.add("isAlternate", Boolean)
            schema.add("confirmed", Boolean)
            schema.add("uid", String)

            return schema
        }
    }

    class Players extends Collection {
        static defineClass() {
            return Player
        }

        getByUid(uid) {
            var result = this.filter(player => player.uid == uid)
            return result && result[0]
        }
    }

    class Game extends Model {

        static defineSchema() {
            var schema = new Schema()

            schema.add("key", String)
            schema.add("activity", String)
            schema.add("platform", String)
            schema.add("players", Players)
            schema.add("date", Date)
            schema.add("startTime", moment, { timezone: "America/Los_Angeles", format: "hh:mma" })
            schema.add("endTime", moment, { timezone: "America/Los_Angeles", format: "hh:mma" })
            schema.add("experience", Number, { default: 0 })

            schema.setOption("useGlobalId", true)

            return schema
        }

        get size() {
            return this.players.size
        }

        get maxSize() {
            return this.isRaid ? 6 : 3
        }

        get isRaid() {
            return this.activity && this.activity.startsWith("raid:")
        }

        get duration() {
            if (!this.startTime || !this.endTime)
                return 0

            return (this.endTime - this.startTime) / (60 * 60 * 1000)
        }

        get score() {
            return this.getScoreWith(this.experience, this.duration, this.size)
        }

        get activityType() {
            return this.activity && this.activity.split(':')[0]
        }

        get displayStartTime() {
            var tz = moment.tz.guess()
            return this.startTime.clone().tz(tz).format("LT")
        }

        get displayEndTime() {
            var tz = moment.tz.guess()
            return this.endTime.clone().tz(tz).format("LT")
        }

        get displayDate() {
            var tz = moment.tz.guess()
            return moment.tz(this.date.toDate(), "America/Los_Angeles").tz(tz).format("ddd MM/DD")
        }

        get displayTimeZone() {
            return moment.tz.guess()
        }

        get displayUpdatedOn() {
            return moment(this.updatedOn.toDate()).fromNow()
        }

        get isConfirmed() {
            var user = firebase.auth().currentUser
            
            if (!user)
                return false
            
            var player = this.players.getByUid(user.uid)
            return player && player.confirmed
        }

        getActivityLookup() {
            if (!this.activityLookup) {
                this.activityLookup = {}
                var field = Activity.getSchema().fields.filter(field => field.name == "activity")[0]
                var groups = field.options.values
                groups.forEach((group) => {
                    group.values.forEach((item) => {
                        var key = group.value + ":" + item.value
                        var label = item.label
                        this.activityLookup[key] = label
                    })
                })
            }

            return this.activityLookup
        }

        get activityName() {
            return this.getActivityLookup()[this.activity]
        }

        getScoreWith(experience, duration, size) {
            var idealExp = this.isRaid ? 32 : 15
            var idealTime = this.isRaid ? 3 : 1.5
            var idealPlayers = this.maxSize + this.maxSize / 2

            var expScore = idealExp - Math.abs(idealExp - this.experience)
            var timeScore = (idealTime - Math.abs(idealTime - this.duration)) * 12.5
            var playerScore = (idealPlayers - Math.abs(idealPlayers - this.size)) * 10

            return expScore + timeScore + playerScore
        }

        getExperienceValue(exp) {
            this.expValues = this.expValues || {
                'newbie': 1,
                'researched': 2,
                'played': 3,
                'completed': 5,
                'veteran': 8,
                'sherpa': 13
            }
            return this.expValues[exp] || 0
        }

        addPlayerProfile(profile) {
            // Hang on to the profile so we can save it later
            this.profiles = this.profiles || []
            this.profiles.push(profile)

            // Add this game the profile
            profile.games = (profile.games || []).concat(this.id)

            // Add this player to the game
            var player = this.addPlayer(
                profile.getPlatform(this.platform),
                profile.getActivity(this.activity),
                profile.getPlayWindow(this.startTime, this.duration)
            )

            // Record uid so we can back games out
            player.uid = profile.id

            return player
        }

        // TODO FIXME Update this to use profile.. Anonymous users will use anonymous auth.
        addPlayer(platform, activity, playWindow) {
            var player = this.players.getById(platform.username)
            var startTime = playWindow.startMoment.clone().tz("America/Los_Angeles")
            var endTime = playWindow.endMoment.clone().tz("America/Los_Angeles")

            // GROSS - DO WE STILL NEED THIS?  Looks like it's adjusts for off by one day.
            if (this.startTime && (startTime - this.startTime) < -12 * 60 * 60 * 1000)
                startTime.add(1, "day")
            
            if (this.endTime && (endTime - this.endTime) < -12 * 60 * 60 * 1000)
                endTime.add(1, "day")
            
            var newStartTime = this.startTime ? moment.max(this.startTime, startTime) : startTime
            var newEndTime = this.endTime ? moment.min(this.endTime, endTime) : endTime
            var newDuration = (newEndTime - newStartTime) / (60 * 60 * 1000)
            var newExperience = this.experience + this.getExperienceValue(activity.experience)

            if (this.isRaid && newDuration < 1.5) 
                return

            if (player) {
                if (this.getExperienceValue(activity.experience) > this.getExperienceValue(player.experience)) {
                    this.experience = this.experience - this.getExperienceValue(player.experience)
                    player.eperience = activity.experience
                }
            }
            else {
                player = this.players.instantiate(platform.username)
                player.username = platform.username
                player.experience = activity.experience
                player.startTime = startTime
                player.endTime = endTime
                this.players.add(player)
            }

            this.startTime = newStartTime
            this.endTime = newEndTime
            this.experience = newExperience

            return player
        }

        removePlayer(username) {
            this.players.remove(username)
            var experience = 0
            var startTime
            var endTime

            this.players.forEach(player => {
                experience += this.getExperienceValue(player.experience)
                startTime = startTime ? moment.max(startTime, player.startTime) : player.startTime
                endTime = endTime ? moment.min(endTime, player.endTime) : player.endTime
            })

            this.experience = experience
            this.startTime = startTime
            this.endTime = endTime
        }

        confirm(profile) {
            var player = this.players.getByUid(profile.id) ||
                this.addPlayerProfile(profile)

            player.confirmed = true
        }

        leave(profile) {
            var player = this.players.getByUid(profile.id)

            if (player) {
                this.removePlayer(player.username)
            }
        }

        log() {
            console.log("Game", this.activity)
            console.log("Platform", this.platform)
            console.log("Time", this.startTime.format("hh:mma"), this.endTime.format("hh:mma"))
            console.log("Score", this.score)
            console.log("Duration", this.duration)
            this.players.forEach(player => console.log(player.username, player.experience, 
                player.startTime.format("hh:mma"), player.endTime.format("hh:mma")
            ))
        }


    }

    class Games extends Collection {
        constructor(path) {
            super("games")
        }

        static defineClass() {
            return Game
        }
    }

    class GameBuilder {
        constructor(players) {
            this.players = players
            this.playerPool = []
            this.playerPools = []
            this.placed = {}
        }

        makePool() {
            this.playerPool = this.players.slice(0)
            return this
        }

        filterPoolByPlaced() {
            this.playerPool = this.playerPool.filter(player => !(player.id in this.placed))

            return this
        }

        filterPoolByPlatform() {
            this.playerPool = this.playerPool.filter(player => player.getPlatform(this.platformName))
            return this
        }

        filterPoolByActivity() {
            this.playerPool = this.playerPool.filter(player => player.getActivity(this.activityName))
            return this
        }

        filterPoolByPlayWindow() {
            this.playerPool = this.playerPool.filter(player => player.canPlay(this.targetMoment, this.duration))

            return this
        }

        shufflePool() {
            var j, x, i;
            
            for (i = this.playerPool.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = this.playerPool[i];
                this.playerPool[i] = this.playerPool[j];
                this.playerPool[j] = x;
            }

            return this;
        }

        pushPool() {
            this.playerPools.push(this.playerPool.slice(0))

            return this
        }

        popPool() {
            this.playerPool = this.playerPools.pop() || []

            return this
        }

        makeExperiencePools() {
            this.expPools = {
                sherpa: [],
                veteran: [],
                completed: [],
                played: [],
                researched: [],
                newbie: []
            }

            this.playerPool.forEach(player => {
                var exp = player.getActivity(this.activityName).experience
                this.expPools[exp].push(player)
            })

            return this
        }

        addPlayers(experience, startIdx, idx, count) {
            var c = 0
    
            while (this.expPools[experience].length > 0) {
                var player = this.expPools[experience].shift()
                var game = this.games.get(idx)

                console.log("Adding", player.username, experience, "to game #", idx)
                game.addPlayerProfile(player)
                this.placed[player.id] = true

                c += 1
        
                if (c >= count) {
                    c = 0
                    idx += 1
                    if (idx >= this.games.size)
                        idx = startIdx
                }
            }

            return idx
        }

        buildGames() {
            var playerCount = this.playerPool.length
            var activityPlayerCount = this.activityName.startsWith("raid:") ? 6 : 3
            var gameCount = Math.floor(playerCount / activityPlayerCount)

            if (!gameCount)
                return this

            console.log("Making", gameCount, "games for", this.activityName, "at", this.targetMoment.format("hh:mm a"))
            
            var startIdx = this.games.size

            for (var i=0; i<gameCount; i++) {
                var game = this.games.add(null, { force: true })
                game.date = this.targetMoment.toDate()
                game.startTime = this.targetMoment.clone()
                game.endTime = this.targetMoment.clone().add(this.duration, 'hours')
                game.activity = this.activityName
                game.platform = this.platformName
            }
    
            var idx = startIdx
            idx = this.addPlayers("sherpa", startIdx, idx, 1)
            idx = this.addPlayers("veteran", startIdx, idx, 1)
            idx = this.addPlayers("completed", startIdx, idx, 2)
            idx = this.addPlayers("played", startIdx, idx, 2)
            idx = this.addPlayers("researched", startIdx, idx, 1)
            idx = this.addPlayers("newbie", startIdx, idx, 1)

            return this
        }

        build(platformName, activityName) {
            this.games = new Games()
            this.platformName = platformName
            this.activityName = activityName
            this.targetMoment = moment.tz('America/Los_Angeles').startOf('day').add(9, 'hours')
            this.duration = activityName.startsWith('raid:') ? 2 : 1
            var playerCount = activityName.startsWith('raid:') ? 6 : 3

            this.makePool()
                .filterPoolByPlaced()
                .filterPoolByPlatform()
                .filterPoolByActivity()
            
            if (this.playerPool.length == 0)
                return this.games

            console.log(this.playerPool.length, "players for", activityName, "on", platformName)

            for (var half=0; half<48; half++) {
                this.pushPool()
                    .filterPoolByPlaced()
                    .filterPoolByPlayWindow()
                    .shufflePool()
                    .makeExperiencePools()

                if (this.playerPool.length >= playerCount) {
                    console.log(this.playerPool.length, "players at", this.targetMoment.format("hh:mma"))
                    
                    this.buildGames()
                }

                this.popPool()

                this.targetMoment.add(30, "minutes")
            }

            return this.games
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Game = Game
        exports.Games = Games
        exports.GameBuilder = GameBuilder
    }
    else if (typeof(window) != "undefined") {
        window.Game = Game
        window.Games = Games
        window.GameBuilder = GameBuilder
    }
})()