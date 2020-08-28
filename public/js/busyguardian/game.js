(function() {
    var Schema = require("./schema").Schema
    var Model = require("./model").Model
    var Collection = require("./collection").Collection
    var Activity = require('./activity').Activity
    var Profiles = require('./profile').Profiles
    var moment = require("moment-timezone").moment || require("moment-timezone")
    var firebase = require("firebase-admin").firebase || require("firebase-admin")

    class Player extends Model {
        static defineSchema() {
            var schema = new Schema()

            schema.add("username", String)
            schema.add("experience", String)
            schema.add("isAlternate", Boolean)
            schema.add("isConfirmed", Boolean)

            return schema
        }
    }

    class Players extends Collection {
        static defineClass() {
            return Player
        }
    }

    class Game extends Model {

        constructor(path, id, data) {                
            super("games", 
                    path == "games" ? id : path, 
                    path == "games" ? data : id)
        }

        static defineSchema() {
            var schema = new Schema()

            schema.add("activity", String, { 
                control: "compoundSelect",
                depth: 2,
                colSizes: [ 4 ],
                placeholders: [ "(Category)", "(Activity)" ],
                values: [
                    { value: "raid", label: "Raid", teamSize: 6, values: [
                        { value: "any", label: "Any" },
                        { value: "leviathan", label: "Leviathan" },
                        { value: "eaterOfWorlds", label: "Eater of Worlds" },
                        { value: "spireOfStars", label: "Spire of Stars" },
                        { value: "lastWish", label: "Last Wish" },
                        { value: "scourgeOfThePast", label: "Scourge of the Past" },
                        { value: "crownOfSorrow", label: "Crown Of Sorrow" },
                        { value: "gardenOfSalvation", label: "Garden of Salvation" }
                    ]},
                    { value: "dungeon", label: "Dungeon", teamSize: 3, values: [
                        { value: "any", label: "Any" },
                        { value: "theShatteredThrone", label: "The Shattered Throne" },
                        { value: "pitOfHeresy", label: "Pit of Heresy" },
                        { value: "prophecy", label: "Prophecy" }
                    ]},
                    { value: "crucible", label: "Crucible", teamSize: 6, values: [
                        { value: "any", label: "Any" },
                        { value: "competitive", label: "Competitive" },
                        { value: "ironBanner", label: "Iron Banner" },
                        { value: "trialsOfOsiris", label: "Trials of Osiris" },

                    ]},
                    { value: "strike", label: "Strike", teamSize: 3, values: [
                        { value: "nightfall", label: "Nightfall" }
                    ]},
                    { value: "story", label: "Story", teamSize: 3, values: [
                        { value: "theWhisper", label: "The Whisper" },
                        { value: "zeroHour", label: "Zero Hour" }
                    ]}
                ]})
            schema.add("platform", String, { control: "select",
            values: [
                { value: "playstation", label: "Playstation" },
                { value: "xbox", label: "Xbox Live" },
                { value: "steam", label: "Steam" },
                { value: "stadia", label: "Stadia" }
            ]})
            schema.add("players", Players, { control: "none" })
            schema.add("date", Date)
            schema.add("startTime", moment, { timezone: "America/Los_Angeles", format: "hh:mma", control: "time" })
            schema.add("endTime", moment, { timezone: "America/Los_Angeles", format: "hh:mma", control: "time" })
            schema.add("description", String, { control: "text"})
            schema.add("experience", Number, { default: 0, control: "none" })

            schema.setOption("useGlobalId", true)

            return schema
        }

        get size() {
            return this.players.size
        }

        get maxSize() {
            return /^(?:raid|crucible):/.test(this.activity) ? 6 : 3
        }

        get isFull() {
            return this.size >= Math.floor(this.maxSize * 1.5)
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

        get pstStartTime() {
            return this.startTime.format("LT") + " PST"
        }

        get isoStartTime() {
            return moment(this.date.toDate()).toISOString()
        }

        get displayEndTime() {
            var tz = moment.tz.guess()
            return this.endTime.clone().tz(tz).format("LT")
        }

        get displayDate() {
            var tz = moment.tz.guess()
            return moment(this.date.toDate()).tz(tz).format("ddd MM/DD")
        }

        get pstDate() {
            return moment(this.date.toDate()).tz("America/Los_Angeles").format("ddd MM/DD")
        }

        get displayTimeZone() {
            return moment.tz.guess()
        }

        get displayUpdatedOn() {
            return moment(this.updatedOn.toDate()).fromNow()
        }

        get displayPlatform() {
            return this.platform.charAt(0).toUpperCase() + this.platform.slice(1);
        }

        get hasJoined() {
            var user = firebase.auth().currentUser
            
            if (!user)
                return false
            
            var player = this.players.getById(user.uid)
            return !!player
        }

        get isConfirmed() {
            var user = firebase.auth().currentUser
            
            if (!user)
                return false
            
            var player = this.players.getById(user.uid)
            return player && player.isConfirmed
        }

        get hasAlternates() {
            return this.players.filter(player => player.isAlternate).length > 0
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

        addPlayer(profile, options) {
            options = options || {}
            var platform = profile.getPlatform(this.platform)
            var activity = profile.getActivity(this.activity)
            
            if (!platform) {
                var msg = `Cannot join because no username defined for ${this.platform}`
                console.info(msg)

                if (options.throw)
                    throw new Error(msg)

                return
            }

            if (this.isFull) {
                var msg = "Cannot join because game is full"
                console.info(msg)

                if (options.throw)
                    throw new Error(msg)
                
                return
            }

            // Add player
            var player = this.players.instantiate(profile.id)
            player.username = platform.username
            player.experience = activity.experience
            player.isAlternate = this.size >= this.maxSize
            this.players.add(player)

            // Hang on to the profile so we can save it later
            this.profiles = this.profiles || []
            this.profiles.push(profile)

            // Add this game the profile
            profile.games = (profile.games || []).concat(this.id)

            // Update game experience
            this.experience = this.experience + this.getExperienceValue(activity.experience)

            return player
        }

        loadProfiles() {
            var ids = this.players.map(player => player.id)
            var profiles = new Profiles()
            return profiles.loadByIds(ids).then(() => profiles)
        }

        removePlayer(uid) {
            this.players.remove(uid)
            var experience = 0

            this.players.forEach(player => {
                experience += this.getExperienceValue(player.experience)
            })

            this.experience = experience
        }

        join(profile) {
            var player = this.players.getById(profile.id)

            if (!player)
                player = this.addPlayer(profile, { ignorePlayWindow: true, throw: true })

            player.isConfirmed = true

            return player
        }

        confirm(profile) {
            var player = this.players.getById(profile.id)

            if (player)
                player.isConfirmed = true

            return player
        }

        leave(profile) {
            this.players.remove(profile.id)
            profile.games = (profile.games || []).filter(gid => gid != this.id)
        }

        toString() {
            var result = 
                "Activity: \t" + this.activityName + "\n" +
                "Platform: \t" + this.displayPlatform + "\n" +
                "Time:     \t" + this.displayDate + " " +
                    this.displayStartTime + " - " +
                    this.displayEndTime + "\n" +
                "Duration: \t" + this.duration + " hours\n" +
                "Players:\n"
            

            this.players.filter(player => !player.isAlternate).forEach(player => {
                result += "         \t\t" + 
                    player.username + " [" + 
                    player.experience + "]\n"
            })
    
            this.players.filter(player => player.isAlternate).forEach(player => {
                result += "         \t\t" + 
                    player.username + " [" + 
                    player.experience + "] (Alternate)\n"
            })

            return result
        }

        toHtmlString() {
            var result = 
                "<p><strong>Activity:</strong> " + this.activityName + "<br />" +
                "<strong>Platform:</strong> " + this.displayPlatform + "<br />" +
                "<strong>Time:</strong> " + this.displayDate + " " +
                    this.displayStartTime + " - " +
                    this.displayEndTime + "<br />" +
                "<strong>Duration:</strong> " + this.duration + " hours<br />" +
                "<strong>Players:</strong> <ul>"
        
            this.players.filter(player => !player.isAlternate).forEach(player => {
                result += "<li>" + 
                        player.username + " [" + 
                        player.experience + "]</li>"
            })

            this.players.filter(player => player.isAlternate).forEach(player => {
                result += "<li>" + 
                        player.username + " [" + 
                        player.experience + "] (Alternate)</li>"
            })

            result += "</ul></p>"

            return result
        }

        log() {
            console.log(this.toString())
        }

        get googleCalendarUrl() {
            var startTime = moment(this.date.toDate())
            var endTime = startTime.clone().add(this.duration, 'hours')

            var startTime = startTime.toISOString().replace(/[\-\:]/g,'').replace(/\.\d\d\dZ/,'Z')
            var endTime = endTime.toISOString().replace(/[\-\:]/g,'').replace(/\.\d\d\dZ/,'Z')

            var url = "https://calendar.google.com/calendar/r/eventedit?" +
                "text=" + escape("Destiny 2: " + this.activityName) + "&" +
                "details=" + escape(this.toHtmlString()) + "&" +
                "location=" + escape(this.displayPlatform) + "&" +
                "dates=" + escape(startTime + "/" + endTime) + "&" +
                "uid=" + escape(this.id)

            return url
        }

        get outlookCalendarUrl() {
            var startTime = moment(this.date.toDate())
            var endTime = startTime.clone().add(this.duration, 'hours')

            var startTime = startTime.toISOString()
            var endTime = endTime.toISOString()

            var url = "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&" +
                "rru=addevent&" +
                "subject=" + escape("Destiny 2: " + this.activityName) + "&" +
                "startdt=" + escape(startTime) + "&" +
                "enddt=" + escape(endTime) + "&" +
                "location=" + escape(this.displayPlatform) + "&" +
                "uid=" + escape(this.id) + "&" +
                "body=" + escape(this.toHtmlString())

            return url
        }

        toIcsCalendar() {
            var startTime = moment(this.date.toDate())
            var endTime = startTime.clone().add(this.duration, 'hours')

            var startTime = startTime.toISOString().replace(/[\-\:]/g,'').replace(/\.\d\d\dZ/,'Z')
            var endTime = endTime.toISOString().replace(/[\-\:]/g,'').replace(/\.\d\d\dZ/,'Z')
            var description = this.toString().replace(/\n/g,"\\n")

            var ics = "BEGIN:VCALENDAR\n" +
                "VESION:2.0\n" +
                "BEGIN:VEVENT\n" +
                "DTSTART:" + startTime + "\n" +
                "DTEND:" + endTime + "\n" +
                "SUMMARY:Destiny 2: " + this.activityName + "\n" +
                "DESCRIPTION:" + description + "\n" +
                "LOCATION:" + this.displayPlatform + "\n" +
                "UID:" + this.id + "\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR\n"

            return ics
        }

        get icsCalendarUrl() {
            var ics = this.toIcsCalendar()
            var url = "data:text/calendar;charset=utf8," + encodeURIComponent(ics)

            return url
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
                game.addPlayer(player)
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
            var activityPlayerCount = /^(?:raid|cruicible):/.test(this.activityName) ? 6 : 3
            var gameCount = Math.round(playerCount / activityPlayerCount)

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
                game.platform = this.displayPlatform
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

        build(platformName, activityName, daysOut) {
            this.games = new Games()
            this.platformName = platformName
            this.activityName = activityName
            this.targetMoment = moment.tz('America/Los_Angeles').startOf('day').add(9, 'hours')

            if (daysOut) {
                this.targetMoment.add(daysOut, 'days')
            }

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
    if (typeof(window) != "undefined") {
        window.Game = Game
        window.Games = Games
        window.GameBuilder = GameBuilder
    }
})()