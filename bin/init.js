#!/usr/bin/env node
global.window = {}

var admin = require('firebase-admin');
var Profile = require('profile').Profile;

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

console.log("Load this in Node REPL using `.load ./init.js`")