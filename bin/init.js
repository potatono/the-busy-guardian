#!/usr/bin/env node
var admin = require('firebase-admin');
var Profile = require('busyguardian').Profile;

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

console.log("Load this in Node REPL using `.load ./init.js`")