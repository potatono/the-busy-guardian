#!/usr/bin/env node
global.window = {}

var admin = require('firebase-admin');
var TestUser = require('test').TestUser

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

function createTestUsers(n, fixture) {
    if (n > 0) {
        console.log("Creating", n, "test user(s)..")
        TestUser.create(true, fixture).then(_ => createTestUsers(n-1, fixture))
    }
}

var n = parseInt(process.argv[2]);

if (!n) {
    console.error(process.argv[1], "num [platform] [activity] [day,day,day] [startTime] [timezone]");
    process.exit(1)
}
var fixture = {}
if (process.argv.length > 3)
    fixture['platforms'] = [{ 'name': process.argv[3] }]

if (process.argv.length > 4)
    fixture['activities'] = [{ 'activity': process.argv[4] }]

if (process.argv.length > 5) {
    days = {}
    process.argv[5].split(',').forEach(day => days[day]=day)
    fixture['playWindows'] = [{ 'days': days }]
}

if (process.argv.length > 6) 
    fixture['playWindows'][0]['startTime'] = process.argv[6]

if (process.argv.length > 7) 
    fixture['timezone'] = process.argv[7]


createTestUsers(n, fixture)
