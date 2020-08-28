(function() {
    var Game = require("./game").Game

    class Buckets {
        constructor() {
            this.data = new Map()
            this.reverse = new Map()
        }

        static getKeyValues(profile) {
            var result = []

            profile.platforms.forEach(platform => {
                profile.activities.forEach(activity => {
                    activity.expandActivity().forEach(act => {
                        profile.playWindows.forEach(playWindow => {
                            playWindow.expandTimes().forEach(time => {
                                result.push({
                                    key: [ platform.name, act.activity, time.key ].join(':'),
                                    time: time,
                                    platform: platform,
                                    playWindow: playWindow,
                                    activity: act,
                                    profile: profile
                                })
                            })
                        })
                    })
                })
            })

            return result
        }

        add(profile) {
            var kvs = Buckets.getKeyValues(profile)

            for (let kv of kvs) {
                if (!this.data.has(kv.key)) {
                    var game = new Game()
                    game.autoCommit = false
                    game.key = kv.key
                    game.activity = kv.activity.activity
                    game.platform = kv.platform.name
                    game.addPlayer(kv.platform, kv.activity, kv.playWindow)

                    this.data.set(kv.key, game)
                }
                else {
                    var game = this.data.get(kv.key)
                    game.addPlayer(kv.platform, kv.activity, kv.playWindow)
                }

                if (this.reverse.has(kv.platform.username)) {
                    this.reverse.get(kv.platform.username).push(kv.key)
                }
                else {
                    this.reverse.set(kv.platform.username, [ kv.key ])
                }
            }

            return profile
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Buckets = Buckets
    }
    if (typeof(window) != "undefined") {
        window.Buckets = Buckets
    }
})()