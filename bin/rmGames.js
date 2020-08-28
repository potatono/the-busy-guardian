#!/usr/bin/env node

var admin = require('firebase-admin');
var Profile = require('busyguardian').Profile
var Games = require('busyguardian').Games
var moment = require('moment-timezone')

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});


var after = process.argv[2];


if (!/\d{4}\-?\d{1,2}\-?\d{1,2}/.test(after)) {
    console.error(process.argv[1], "YYYY-MM-DD");
    process.exit(1)
}

var afterMoment = moment.tz(after, "YYYY-MM-DD", false, moment.tz.guess())
var games = new Games()
var col = games.col().where('date', '<=', afterMoment.toDate())

games.loadAll(col).then(() => {
    games.forEach(game => {
        game.players.forEach(player => {
            if (player.uid) {
                var profile = new Profile(player.uid)
                profile.load().then(() => {
                    profile.games = (profile.games || []).filter(gid => gid != game.id)
                })
            }

            player.delete()
        })

        game.delete()
    })

    console.log(`${games.length} games removed..`)
})


