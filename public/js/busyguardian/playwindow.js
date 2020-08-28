(function() {
    var Schema = require("./schema").Schema
    var Model = require("./model").Model
    var Collection = require("./collection").Collection
    var moment = require("moment-timezone").moment || require("moment-timezone")

    class PlayWindow extends Model {
        static defineSchema() {
            var schema = new Schema()

            schema.add("days", Set, { values: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ], colSize: 6 })
            schema.add("startTime", String, { control: "time" })
            schema.add("endTime", String, { control: "time" })
            schema.add("timezone", String, { control: "none" })
            schema.setOption("form", { type: "inline" })
            return schema
        }

        // TODO REFACTOR - Make use moment type supported by model.  Model needs setter support for string->moment
        get startMoment() {
            if (!this._startMoment) 
                this._startMoment = moment.tz(this.startTime, "hh:mm a", false, this.timezone)

            return this._startMoment
        }

        get endMoment() {
            if (!this._endMoment)
                this._endMoment = moment.tz(this.endTime, "hh:mm a", false, this.timezone)
            return this._endMoment
        }

        dayAfter(a, b) {
            var diff = a.day() - b.day()
            return diff == 1 || diff == 6
        }

        dayBefore(a, b) {
            var diff = a.day() - b.day()
            return diff == -1 || diff == -6
        }

        // Planning around change over from daylight savings will be off by one
        canPlay(targetMoment, duration) {
            if (!this.timezone || !this.startTime || !this.endTime)
                return false

            // Move target moment to your local timezone
            let localMoment = targetMoment.clone().tz(this.timezone)

            // We do everything in time so we can work out edge cases around midnight.
            let targetTime = localMoment - localMoment.clone().startOf('day')

            let startMoment = this.startMoment
            let startTime = startMoment - startMoment.clone().startOf('day')
            
            let endMoment = this.endMoment
            let endTime = endMoment - endMoment.clone().startOf('day')

            // If the endTime crosses a midnight boundry then it is the next day
            if (endTime < startTime) {
                endTime += 86400000
            }

            // If the timezone shift resulted in a day change add a day to the time
            if (this.dayAfter(localMoment, targetMoment) && endTime > 86400000) {
                targetTime += 86400000    
            }

            // The target day of the week is the day of your startTime.  If your timezone
            // is far away from PST we may need to add a day.  If you happen to be in Honolulu
            // we may need to subract one.
            var dowMoment = startMoment.clone()

            // If planning before reset time add a day
            if (targetMoment.hour() < 9)
                dowMoment.add(1, 'day')
           
            var targetDowMoment = dowMoment.clone().tz("America/Los_Angeles")

            // Edge case around midnight in PST is the day before in Honolulu.
            if (this.dayBefore(dowMoment, targetDowMoment)) {
                dowMoment.subtract(1, 'day').format('ddd')
            }
            else if (dowMoment.day() != targetDowMoment.day()) {
                dowMoment.add(1, 'day').format("ddd")
            }

            // If the targetMoment is in the future, add days
            dowMoment.add(targetMoment.diff(dowMoment, 'days'), 'days')
            var targetDow = dowMoment.format("ddd")

            // console.log(this.days, targetDow, targetTime/1000, startTime/1000, endTime/1000, targetTime >= startTime && targetTime <= endTime)
            var result = this.days.has(targetDow) && targetTime >= startTime && targetTime <= endTime
            
            if (!duration || !result)
                return result

            targetTime += duration * 60 * 60 * 1000
            // console.log(targetTime/1000, startTime/1000, endTime/1000, targetTime >= startTime && targetTime <= endTime)

            return result && targetTime >= startTime && targetTime <= endTime
        
        }

        expandTimes() {
            // Daily reset
            var targetMoment = moment.tz('America/Los_Angeles').startOf('day').add(9, 'hours')
            var result = []

            for (var half=0; half<48; half++) {
                if (this.canPlay(targetMoment)) {
                    var key = targetMoment.format('hh:mma')
                    result.push({
                        key: key,
                        half: half
                    })
                }

                targetMoment.add(30, 'minutes')
            }
            
            return result
        }
    }

    class PlayWindows extends Collection {
        static defineClass() {
            return PlayWindow
        }
    }

    if (typeof(exports) != "undefined") {
        exports.PlayWindow = PlayWindow
        exports.PlayWindows = PlayWindows
    }
    if (typeof(window) != "undefined") {
        window.PlayWindow = PlayWindow
        window.PlayWindows = PlayWindows
    }
})()
