(function() {
    var Schema = window.Schema || require("schema").Schema
    var Model = window.Model || require("model").Model
    var Collection = window.Collection || require("collection").Collection
    var Platforms = window.Platforms || require("./platform").Platforms
    var PlayWindows = window.PlayWindows || require("./playwindow").PlayWindows
    var Activities = window.Activities || require("./activity").Activities
    var moment = window.moment || require("moment-timezone")

    class Profile extends Model {
        constructor(path, id, data) {
            super("profiles", 
                  path == "profiles" ? id : path, 
                  path == "profiles" ? data : id)

            this.playWindows.addListener((change, playWindow) =>  {
                if (change == "added") {
                    playWindow.autoCommit = this.autoCommit
                    playWindow.timezone = this.timezone
                }
            })
        }

        static defineSchema() {
            var schema = new Schema()
            schema.add("username", String, { help: "Choose a name to display to other players on TbG", unique:true })
            schema.add("email", String, { 
                help: "Email address to send notifications to.  We do not share your personal information. (OPTIONAL)" })
            schema.add("discordUsername", String, {
                help: "Your Discord username, including tag.  You'll need to join https://discord.gg/Z88Dv6W for Discord notifications. (OPTIONAL)" })
            schema.add("timezone", String, { control: "select", values: moment.tz.names(), default: moment.tz.guess(), label: "Time Zone",
                help: "What timezone you will be playing in.  We've guessed, but make sure it looks right to you." })
            schema.add("notifyVia", String, { control: "select", values: ["email", "discord"], default: "email", label:"Send Notifications To",
                help: "How you would like to be notified when added to a fireteam.  You'll need to join https://discord.gg/Z88Dv6W for Discord notifications." })

            schema.add("playWindows", PlayWindows, {
                help: "The days and times you are typically available to play."
            })
            schema.add("platforms", Platforms, {
                help: "The gaming platform(s) you want to play on."})
            schema.add("activities", Activities, {
                help: "The activities you're interested in playing, and your experience playing them."
            })
            schema.add("isTestUser", Boolean, { control: "none", default: false })
            schema.add("bungiePrimaryMembershipId", Number, { control: "none" }),
            schema.add("bungiePrimaryMembershipType", Number, { control: "none" })
            schema.add("bungieImportComplete", Boolean, { control: "none", default: false })
            schema.add("games", Array, { control: "none", default: [] })
            
            schema.setOption("useGlobalId", true)

            return schema
        }

        getPlatform(platform) {
            if (!this.platformLookup) {
                this.platformLookup = {}
                this.platforms.forEach(p => this.platformLookup[p.name] = p)
            }

            return platform in this.platformLookup && this.platformLookup[platform]
        }

        getActivity(activity) {
            if (!this.activityLookup) {
                this.activityLookup = {}
                this.activities.forEach(activity => {
                    activity.expandActivity().forEach(expanded => { 
                        // TODO FIXME Need max of lookup and expanded
                        this.activityLookup[expanded.activity] = expanded
                    })
                })
            }

            return activity in this.activityLookup && this.activityLookup[activity]
        }

        canPlay(targetMoment, duration) {
            var result = false
            this.playWindows.forEach(playWindow => result = result || playWindow.canPlay(targetMoment, duration))

            return result
        }

        getPlayWindow(targetMoment, duration) {
            var result = this.playWindows.filter(playWindow => playWindow.canPlay(targetMoment, duration))
            return result && result[0]
        }
    }
    
    class Profiles extends Collection {
        constructor(path) {
            super("profiles")
        }

        static defineClass() {
            return Profile
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Profile = Profile
        exports.Profiles = Profiles
    }
    else if (typeof(window) != "undefined") {
        window.Profile = Profile
        window.Profiles = Profiles
    }
})()
