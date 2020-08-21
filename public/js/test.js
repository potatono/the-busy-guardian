(function() {
    var Profile = window.Profile || require('profile').Profile
    var moment = window.moment || require('moment-timezone')

    function randomMember(array) {
        var idx = Math.floor(Math.random() * array.length)
        return array[idx]
    }
    
    function addPlatform(profile, save, fixture) {
        var platform = profile.platforms.add(null, { force: true })
        platform.autoCommit = false

        var name = fixture.name || randomMember(profile.platforms.schema.name.options.values).value
        platform.name = name
        platform.username = profile.username
    
        return save && platform.save()
    }
    
    function addPlayWindow(profile, save, fixture) {
        var playWindow = profile.playWindows.add(null, { force: true })
        playWindow.autoCommit = false
    
        var startHour = Math.floor(Math.random() * 24)
        var startMinute = Math.random() > 0.5 ? 30 : 0
        playWindow.startTime = fixture.startTime || (('0' + startHour).slice(-2) + ":" + ('0' + startMinute).slice(-2))
    
    
        var endHour = startHour + Math.floor(Math.random() * 3) + 1
        var endMinute = Math.random() > 0.5 ? 30 : 0
        if (endHour > 23) endHour -= 24
        playWindow.endTime = fixture.endTime || (('0' + endHour).slice(-2) + ":" + ('0' + endMinute).slice(-2))
    
        for (let day of [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ])
            if ((fixture.days && day in fixture.days) || (!fixture.days && Math.random() > 0.5))
                playWindow.days.add(day)
    
        return save && playWindow.save()
    }
    
    function addActivity(profile, save, fixture) {
        var activity = profile.activities.add(null, { force: true })
        activity.autoCommit = false
    
        var group = randomMember(activity.schema.activity.options.values)
        var item = randomMember(group.values)
        var activityValue = [ group.value, item.value ].join(':')
    
        activity.activity = fixture.activity || activityValue
        activity.experience = fixture.experience || randomMember(activity.schema.experience.options.values).value

        return save && activity.save()
    }

    class TestUser {
        static create(save, fixture) {
            fixture = fixture || {}

            var profile = new Profile()
            profile.autoCommit = false

            profile.username = fixture.username || ("testuser-" + Math.floor(Math.random()* 1000000).toString(36))
            profile.isTestUser = true
            profile.timezone = fixture.timezone || randomMember([ 'America/New_York', 'America/Los_Angeles', 'US/Central', 'US/Mountain' ])

            var promises = []

            if (save)
                promises.push(profile.save())
            
            let platforms = fixture.platforms || [{}]
            for (let platform of platforms)
                promises.push(addPlatform(profile, save, platform))

            let playWindows = fixture.playWindows || [{}]
            for (let playWindow of playWindows)
                promises.push(addPlayWindow(profile, save, playWindow))

            let activities = fixture.activities || [{}, {}, {}]
            for (let activity of activities)
                promises.push(addActivity(profile, save, activity))
    
            return Promise.all(promises).then(_ => profile)
        }
    }

    if (typeof(exports) != "undefined") {
        exports.TestUser = TestUser
    }
    else if (typeof(window) != "undefined") {
        window.TestUser = TestUser
    }
})()