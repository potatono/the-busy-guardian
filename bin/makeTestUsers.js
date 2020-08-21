#!/usr/bin/env node
global.window = {}

var admin = require('firebase-admin');
const { symlinkSync } = require('fs');
var TestUser = require('test').TestUser

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

function createTestUsers(n) {
    if (n > 0) {
        console.log("Creating", n, "test user(s)..")
        TestUser.create(true).then(_ => createTestUsers(n-1))
    }
}

var n = parseInt(process.argv[2]);

if (!n) {
    console.error(process.argv[1], "num");
    process.exit(1)
}

createTestUsers(n)
