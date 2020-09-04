#!/usr/bin/env node

var admin = require('firebase-admin');
var Game = require('busyguardian').Game
var Notification = require('busyguardian').Notification
var config = require('../functions/.runtimeconfig.json')    

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

var gid = process.argv[2];

if (!gid) {
    console.error(process.argv[1], "gid");
    process.exit(1)
}

var game = new Game(gid)
game.load().then(() => {
    game.loadProfiles().then(profiles => {
        var notification = new Notification(config, game, profiles, "You have been added to a game")
        notification.send().catch(err => {
            console.error(err)
        })
    })
})
