#!/usr/bin/env node

if (typeof(window) == "undefined") global.window = {}

var admin = require('firebase-admin');
var Model = require('model').Model
var Profiles = require('profile').Profiles
var Activity = require('activity').Activity
var Platform = require('platform').Platform
var GameBuilder = require('game').GameBuilder

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

Model.autoCommit = false

function getAllPlayers() {
    var profiles = new Profiles()
    return profiles.loadAll()
}

function getAllPlatforms() {
    var schema = Platform.getSchema()
    return schema.get('name').options.values.map(v => v.value)
}

function getAllActivities() {
    var schema = Activity.getSchema()
    var result = []

    schema.get('activity').options.values.forEach(group => {
        group.values.forEach(item => { if (item.value != "any") result.push([ group.value, item.value ].join(':')) })
    })

    return result
}

var commit = process.argv[2] == "commit";

var time = (new Date()).getTime()
var platforms = getAllPlatforms()
var activities = getAllActivities()

console.log("Loading players...")

getAllPlayers().then(players => {
    var builder = new GameBuilder(players)

    platforms.forEach(platform => { activities.forEach(activity => {
        var games = builder.build(platform, activity)

        games.forEach(game => {
            game.log()

            if (commit) {
                game.save()

                if (game.profiles)
                    game.profiles.forEach(profile => profile.save())
            }
        })
    }) })

    var endTime = (new Date()).getTime()

    console.log("Placed", players.length, "players in", (endTime - time)/1000, "seconds.")
    
    if (!commit) {
        console.log("Did not save games. Use `",process.argv[1]," commit` to save.")
    }
})