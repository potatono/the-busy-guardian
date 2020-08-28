#!/usr/bin/env node

var admin = require('firebase-admin');
var Profiles = require('busyguardian').Profiles

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});


var yes = process.argv[2];

if (!/[yY][eE]?[sS]?/.test(yes)) {
    console.error(process.argv[1], "yes");
    process.exit(1)
}

var profiles = new Profiles()
var col = profiles.col().where('isTestUser', '==', true)
profiles.deleteAll(col).then(() => console.log(`${profiles.length} profiles removed..`))