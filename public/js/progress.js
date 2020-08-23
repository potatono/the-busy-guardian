(function() {
    class Progress {
        static report(value) {
            if (typeof(value) != 'undefined') {
                Progress.value = value
            }
            else {
                Progress.step = Progress.step || 10
                Progress.value = Progress.value || 0
                Progress.value += Progress.step    
            }

            let listeners = Progress.listeners || []
            listeners.forEach(listener => listener(Progress.value))
        }

        static addListener(listener) {
            Progress.listeners = Progress.listeners || []
            Progress.listeners.push(listener)
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Progress = Progress
    }
    else if (typeof(window) != "undefined") {
        window.Progress = Progress
    }
})()