#!/usr/bin/env node

var admin = require('firebase-admin');
var Game = require('busyguardian').Game
var Notification = require('busyguardian').Notification


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});


var game = new Game('3e9c63-A34my-g4zt')
game.load().then(() => {
    game.loadProfiles().then(profiles => {
        var notification = new Notification(game, profiles, "You have been added to a game")
        notification.send().catch(err => {
            console.error(err)
        })
    })
})
