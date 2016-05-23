var events = require('events');

exports.Test = function() {
    function handleEvent(args) {
        console.log("got this: " + JSON.stringify(args));
    }
}
