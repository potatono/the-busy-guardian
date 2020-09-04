(function() {
    var Schema = require("./schema").Schema
    var Model = require("./model").Model
    var Collection = require("./collection").Collection
    var Platforms = require("./platform").Platforms
    var PlayWindows = require("./playwindow").PlayWindows
    var Activities = require("./activity").Activities
    var moment = require("moment-timezone").moment || require("moment-timezone")

    class Profile extends Model {
        constructor(id, options) {
            super(id, options)

            this.playWindows.addListener((change, playWindow) =>  {
                if (change == "added") {
                    playWindow.autoCommit = this.autoCommit
                    playWindow.timezone = this.timezone
                }
            })
        }

        static defineSchema() {
            var schema = new Schema()
            schema.add("username", String, { help: "Choose a name to display to other players on TbG" })
            schema.add("email", String, { label: "Email (Optional)",
                help: "Email address to send notifications to.  We do not share your personal information."
            })
            schema.add("discordId", String, { label: "Discord Snowflake (See help, Optional)",
                help: "<p>Your 16 to 20 digit numeric " +
                      "\"<a href=\"https://discord.com/developers/docs/reference#snowflakes\" target=\"_blank\">snowflake</a>\" " + 
                      "user id.</p> <p>You can say <code>\\@YOUR_USERNAME</code> on Discord to get your id, or " +
                      "click <a href=\"/discord\">this link</a>.</p><p>You'll need to join " +
                      "<a href=\"https://discord.gg/Z88Dv6W\" target=\"_blank\">https://discord.gg/Z88Dv6W</a> for Discord notifications.</p>"
            })
            schema.add("timezone", String, { control: "select", values: moment.tz.names(), default: moment.tz.guess(), label: "Time Zone",
                help: "What timezone you will be playing in.  We've guessed, but make sure it looks right to you."
            })
            schema.add("notifyVia", Set, { values: ["email", "discord"], default: new Set(["email", "discord"]), label:"Send Notifications To",
                help: "How you would like to be notified when added to a fireteam.  You'll need to join " +
                      "<a href=\"https://discord.gg/Z88Dv6W\" target=\"_blank\">https://discord.gg/Z88Dv6W</a> for Discord notifications."
            })
            schema.add("playWindows", PlayWindows, {
                help: "The days and times you are typically available to play."
            })
            schema.add("platforms", Platforms, {
                help: "The gaming platform(s) you want to play on."
            })
            schema.add("activities", Activities, {
                help: "The activities you're interested in playing, and your experience playing them."
            })
            schema.add("isTestUser", Boolean, { control: "none", default: false })
            schema.add("bungiePrimaryMembershipId", Number, { control: "none" }),
            schema.add("bungiePrimaryMembershipType", Number, { control: "none" })
            schema.add("bungieImportComplete", Boolean, { control: "none", default: false })
            schema.add("games", Array, { control: "none", default: [] })
            // Rules prevent users from editing their own awards, but we'll initialize to the defaults for the
            // first load experience.
            schema.add("awards", Array, { control: "none", default: ["Beta Tester"], readonly: true })
            
            schema.setOption("useGlobalId", true)
            schema.setOption("defaultPath", "profiles")

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
    if (typeof(window) != "undefined") {
        window.Profile = Profile
        window.Profiles = Profiles
    }
})()
