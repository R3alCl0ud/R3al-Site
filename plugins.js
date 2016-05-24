/*
PLUGIN LOADER 1.0....Expect issues
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

var util = require('./lib/util/util');

var plugins = util.openJSON("plugins.json");

exports.plList = [];
var plLoaded = [];

exports.pluginManager = function(pluginObject, isActive, ARGS) {
    this.plugin = pluginObject;
    this.active = isActive;
    this.params = ARGS;
    this.type = this.plugin.start();
};

var createPlugin = function(intentObj) {
    intentObj.active = true;
};

for (var i = 0; i < plugins.plugins.length; i++) {
    console.log("Attempging to load plugin: "+plugins.plugins[i]+".js");
    exports.plList.push(require('./plugins/'+plugins.plugins[i]));
    console.log("./plugins/"+plugins.plugins[i]);
}
