if (typeof(module) == "undefined")
    var module = { exports: {} }

if (typeof(exports) == "undefined")
    var exports = module.exports

function require() {
    return window
}