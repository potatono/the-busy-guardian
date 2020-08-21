#!/usr/bin/env node

if (typeof(window) == "undefined") global.window = {}

var TestUser = require("test").TestUser
var admin = require('firebase-admin');
var Model = require('model').Model
var Activity = require('activity').Activity
var Platform = require('platform').Platform
var GameBuilder = require('game').GameBuilder

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

Model.autoCommit = false

function makeTestUsers(result, n) {
    return TestUser.create().then(profile => {
        result.push(profile)

        return n > 0 ? makeTestUsers(result, n - 1) : result
    })
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

var playerCount = 100000
var time = (new Date()).getTime()
var platforms = getAllPlatforms()
var activities = getAllActivities()

console.log("Making test users...")

makeTestUsers([], playerCount).then(players => {

    var builder = new GameBuilder(players)

    platforms.forEach(platform => { activities.forEach(activity => {
        var games = builder.build(platform, activity)
        games.forEach(game => game.log())
    }) })

    var endTime = (new Date()).getTime()

    console.log("Placed", playerCount, "players in", (endTime - time)/1000, "seconds.")
})