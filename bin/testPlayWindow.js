#!/usr/bin/env node

if (typeof(window) == "undefined") global.window = {}

const assert = require('assert')
const { exit } = require('process')
const util = require('util')

var admin = require('firebase-admin')
var Model = require('model').Model
var PlayWindow = require('playwindow').PlayWindow
var moment = require("moment-timezone")



admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://the-busy-guardian.firebaseio.com'
});

Model.autoCommit = false

var testNumber = 0

function assertOk(value, message) {
    var ok = true
    
    try { assert(value) }
    catch (err) { ok = false }

    testNumber += 1
    console.log("Test #%d: %s -- %s", testNumber, message, ok ? "OK" : "NOTOK")

    if (!ok) 
        exit(1)
}

function testCanPlay(targetMoment, duration, startTime, endTime, timezone, day) {
    var playWindow = new PlayWindow()
    playWindow.days.add(day)
    playWindow.timezone = timezone
    playWindow.startTime = startTime
    playWindow.endTime = endTime

    return playWindow.canPlay(targetMoment, duration)
}

function assertCanPlay(time, duration, startTime, endTime, timezone, dayOffset=0) {
    var targetMoment = moment.tz(time, "hh:mma", false, "America/Los_Angeles")

    // When we make games we walk half hours from reset and will cross the midnight
    // boundry, so any hours before 9 should be next day
    if (targetMoment.hours() < 9)
        targetMoment.add(1, 'day')

    var day = moment.tz().add(dayOffset, "day").format("ddd")
    var targetDay = targetMoment.format("ddd")
    var value = testCanPlay(targetMoment, duration, startTime, endTime, timezone, day)
    var msg = util.format("%s+%d (PST) %s in %s-%s %s (%s)", time, duration, targetDay, startTime, endTime, day, timezone)

    assertOk(value, msg)
}

function assertCantPlay(time, duration, startTime, endTime, timezone, dayOffset=0) {
    var targetMoment = moment.tz(time, "hh:mma", false, "America/Los_Angeles")

    // When we make games we walk half hours from reset and will cross the midnight
    // boundry, so any hours before 9 should be next day
    if (targetMoment.hours() < 9)
        targetMoment.add(1, 'day')

    var day = moment.tz().add(dayOffset, "day").format("ddd")
    var targetDay = targetMoment.format("ddd")

    var value = testCanPlay(targetMoment, duration, startTime, endTime, timezone, day)
    var msg = util.format("%s+%d (PST) %s NOT in %s-%s %s (%s)", time, duration, targetDay, startTime, endTime, day, timezone)

    assertOk(!value, msg)
}

assertCanPlay("5:30pm", 2, "8:30pm", "12am", "America/New_York")
assertCanPlay("6:00pm", 2, "8:30pm", "12am", "America/New_York")
assertCanPlay("7:00pm", 2, "8:30pm", "12am", "America/New_York")
assertCanPlay("9:00pm", 2, "11:30pm", "3:00am", "America/New_York")
assertCantPlay("5:30pm", 2, "8:30pm", "10pm", "America/New_York")
assertCantPlay("5:00pm", 2, "8:30pm", "12am", "America/New_York")

assertCanPlay("11:00pm", 2, "2:00am", "4:00am", "America/New_York", 1)
assertCanPlay("12:00am", 2, "3:00am", "5:00am", "America/New_York", 1)
assertCanPlay("2:00am", 2, "5:00am", "9:00am", "America/New_York", 1)
assertCanPlay("4:00am", 2, "7:00am", "11:00am", "America/New_York", 1)
assertCanPlay("8:00am", 2, "11:00am", "1:00pm", "America/New_York", 1)
assertCanPlay("9:00am", 2, "12:00pm", "2:00pm", "America/New_York")

assertCanPlay("7:30am", 2, "3:00pm", "6:00pm", "Europe/London", 1)
assertCanPlay("3:30pm", 2, "11:00pm", "4:00am", "Europe/London")
assertCantPlay("5:00pm", 2, "2:00am", "5:00am", "Europe/London", 1)
assertCanPlay("6:00pm", 2, "2:00am", "5:00am", "Europe/London", 1)
assertCanPlay("7:00pm", 2, "2:00am", "5:00am", "Europe/London", 1)
assertCantPlay("8:00pm", 2, "2:00am", "5:00am", "Europe/London", 1)

assertCanPlay("7:00am", 2, "11:00pm", "3:00am", "Asia/Tokyo",1)  // 7am morning after reset
assertCanPlay("8:00am", 2, "12:00am", "4:00am", "Asia/Tokyo", 2) // 8am morning after reset + after midnight in Tokyo
assertCanPlay("9:00am", 2, "1:00am", "5:00am", "Asia/Tokyo", 1)  // 9am reset + after midnight in Tokyo
assertCanPlay("10:00am", 2, "2:00am", "6:00am", "Asia/Tokyo", 1) 

assertCanPlay("11:00pm", 2, "6:00pm", "9:00pm", "Pacific/Auckland", 1)
assertCanPlay("4:00am", 2, "11:00pm", "3:00am", "Pacific/Auckland", 1)
assertCanPlay("5:00am", 2, "12:00am", "4:00am", "Pacific/Auckland", 2) // 5am morning after reset + after mignight in Auckland
assertCanPlay("6:00am", 2, "1:00am", "5:00am", "Pacific/Auckland", 2)
assertCanPlay("7:00am", 2, "2:00am", "6:00am", "Pacific/Auckland", 2)
assertCanPlay("8:00am", 2, "3:00am", "7:00am", "Pacific/Auckland", 2)
assertCanPlay("9:00am", 2, "4:00am", "8:00am", "Pacific/Auckland", 1)
assertCanPlay("10:00am", 2, "5:00am", "9:00am", "Pacific/Auckland", 1)

assertCanPlay("11:00pm", 2, "8:00pm", "10:00pm", "Pacific/Honolulu")
assertCanPlay("12:00am", 2, "9:00pm", "11:00pm", "Pacific/Honolulu")
assertCanPlay("1:00am", 2, "10:00pm", "12:00am", "Pacific/Honolulu")
assertCanPlay("2:00am", 2, "11:00pm", "1:00am", "Pacific/Honolulu")
assertCanPlay("3:00am", 2, "12:00am", "2:00am", "Pacific/Honolulu", 1)

assertCanPlay("11:00pm", 2, "7:00pm", "9:00pm", "US/Samoa")
assertCanPlay("12:00am", 2, "8:00pm", "10:00pm", "US/Samoa")
assertCanPlay("3:00am", 2, "11:00pm", "1:00am", "US/Samoa")
assertCanPlay("4:00am", 2, "12:00am", "2:00am", "US/Samoa", 1)
assertCanPlay("8:00am", 2, "4:00am", "6:00am", "US/Samoa", 1)
assertCanPlay("9:00am", 2, "5:00am", "7:00am", "US/Samoa")

assertCanPlay("11:00pm", 2, "7:00pm", "9:00pm", "Pacific/Tongatapu", 1)  // OMG +13 == -11 + 1 day
assertCanPlay("12:00am", 2, "8:00pm", "10:00pm", "Pacific/Tongatapu", 1)
assertCanPlay("3:00am", 2, "11:00pm", "1:00am", "Pacific/Tongatapu", 1)
assertCanPlay("4:00am", 2, "12:00am", "2:00am", "Pacific/Tongatapu", 2)
assertCanPlay("8:00am", 2, "4:00am", "6:00am", "Pacific/Tongatapu", 2)
assertCanPlay("9:00am", 2, "5:00am", "7:00am", "Pacific/Tongatapu", 1)


