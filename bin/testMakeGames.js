#!/usr/bin/env node

if (typeof(window) == "undefined") global.window = {}

var admin = require('firebase-admin');
var TestUser = require('test').TestUser
var Model = require('model').Model
var Activity = require('activity').Activity
var Platform = require('platform').Platform
var GameBuilder = require('game').GameBuilder

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

Model.autoCommit = false

var fixtures = {
    players: [{ 
        username: 'Max',
        timezone: 'America/Los_Angeles',
        playWindows: [{ 
            days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true },
            startTime: "5:30 PM",
            endTime: "11:00 PM"
        }],
        platforms: [ { name: 'steam' } ],
        activities: [ { activity: 'dungeon:prophecy', experience: 'completed' }]
    },
    { 
        username: 'James',
        timezone: 'America/New_York',
        playWindows: [{ 
            days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true },
            startTime: "8:30 PM",
            endTime: "12:00 AM"
        }],
        platforms: [ { name: 'steam' } ],
        activities: [ { activity: 'dungeon:prophecy', experience: 'completed' }]
    },
    { 
        username: 'Ben',
        timezone: 'Europe/London',
        playWindows: [{ 
            days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true },
            startTime: "11:30 PM",
            endTime: "4:00 AM"
        }],
        platforms: [ { name: 'steam' } ],
        activities: [ { activity: 'dungeon:prophecy', experience: 'completed' }]
    },
    { 
        username: 'Alana',
        timezone: 'Asia/Tokyo',
        playWindows: [{ 
            days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true },
            startTime: "8:00 AM",
            endTime: "3:00 PM"
        }],
        platforms: [ { name: 'steam' } ],
        activities: [ { activity: 'dungeon:prophecy', experience: 'completed' }]
    }
]
}

var players;
var allPlatforms;
var allActivities;

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

function makeTestUsers(result, fixtures) {
    let fixture = fixtures.shift()
    return TestUser.create(false, fixture).then(profile => {
        result.push(profile)

        return fixtures.length > 0 ? makeTestUsers(result, fixtures) : result
    })
}

function setup() {
    players = []

    allPlatforms = getAllPlatforms()
    allActivities = getAllActivities()
    return makeTestUsers(players, fixtures.players)
}

setup().then(players => {
    var builder = new GameBuilder(players)

    allPlatforms.forEach(platform => { allActivities.forEach(activity => {
        var games = builder.build(platform, activity)
        games.forEach(game => game.log())
    }) })
  
})