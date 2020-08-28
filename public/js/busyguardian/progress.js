(function() {
    class Progress {
        static reset() {
            Progress.step = 10
            Progress.report(0)
        }

        static report(value) {
            if (typeof(value) != 'undefined') {
                Progress.value = value
            }
            else {
                Progress.value += Progress.step    
            }

            let listeners = Progress.listeners || []
            listeners.forEach(listener => listener(Progress.value))

            return Progress.value
        }

        static addListener(listener) {
            Progress.listeners = Progress.listeners || []
            Progress.listeners.push(listener)
        }
    }

    Progress.reset()

    if (typeof(exports) != "undefined") {
        exports.Progress = Progress
    }
    if (typeof(window) != "undefined") {
        window.Progress = Progress
    }
})()