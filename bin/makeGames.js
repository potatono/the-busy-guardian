#!/usr/bin/env node

var admin = require('firebase-admin');
var Model = require('busyguardian').Model
var Profiles = require('busyguardian').Profiles
var Activity = require('busyguardian').Activity
var Platform = require('busyguardian').Platform
var GameBuilder = require('busyguardian').GameBuilder

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

var daysOut = parseInt(process.argv[2]) || 0
var commit = process.argv[process.argv.length - 1] == "commit";

var time = (new Date()).getTime()
var platforms = getAllPlatforms()
var activities = getAllActivities()

console.log("Loading players...")

getAllPlayers().then(players => {
    var builder = new GameBuilder(players)

    platforms.forEach(platform => { activities.forEach(activity => {
        var games = builder.build(platform, activity, daysOut)

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
        console.log("Did not save games. Use `",process.argv[1]," [daysOut] commit` to save.")
    }
})
.catch(err => console.error(err))