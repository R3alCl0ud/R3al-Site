var CommandRegistry = require('../../../lib/CommandRegistry');

var exampleCmd = function (bot, msg, usr) {
    console.log("called");
    msg.reply("Example Reply");
}

var exampleCommand = new CommandRegistry.Command("exampleCommand", "Exmaple Command for API docs", exampleCmd);
var exampleTwo = new CommandRegistry.Command("exampleTwo", "Another Example for testing", function() {});
var testCommand = new CommandRegistry.Command("testCommand", "A test plugin!", function() {});