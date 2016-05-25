/*
PLUGIN LOADER 1.0.0_a1....Expect issues
ALL Plugins will be loaded so long as they are
present in plugins.json file.
*/

// this is the plugin manager prototype, this will manage whether
// or not the plugin is currently active.
/*
The isActive paramater is a boolean value that will be defaulted to false.
The parameter ARGS is defined as an object of data that will be given to the
plugin to be used for later execution.
*/

"use strict";
var util = require('./lib/util/util');
var fs = require('fs');
var plugins = util.openJSON("plugins.json");

var Plugin = require('./lib/Plugin');

var pluginFolder = fs.readdirSync("./plugins");

var plLoaded = [];

var CommandRegistry = require('./lib/CommandRegistry');



var createPlugin = function(intentObj) {
    intentObj.active = true;
};

for (var plugin in pluginFolder) {
    if (fs.lstatSync('./plugins/'+pluginFolder[plugin]).isDirectory()) {
        var plFolder = fs.readdirSync('./plugins/' + pluginFolder[plugin]);
        for (var file in plFolder)
        {
            if (!fs.lstatSync('./plugins/'+pluginFolder[plugin]+'/'+plFolder[file]).isDirectory()) {
                var parts = plFolder[file].split(".");
                var ext = parts[parts.length-1];
                var file_no_ext = parts.splice(0,parts.length-1).join(".");
                
                var potPlugin = require('./plugins/' + pluginFolder[plugin] + '/' + file_no_ext);
                
                if (potPlugin instanceof Plugin)
                {
                    console.log("New Plugin Found! " + potPlugin.name + " By: " + potPlugin.author);
                }
                else
                {
                    console.log("Non-plugin object found, ignoring");
                }
            }
        }
    }
}
module.exports = Plugin;