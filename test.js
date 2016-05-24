var plugins = require("./plugins");

var cmdList = {};

for (var i = 0; i < plugins.plList.length; i++) {

    var plugin = new plugins.pluginManager(plugins.plList[i], true, {});

    console.log(plugin.type);

    if (plugin.type == "chat") {
        for (cmd in plugin.plugin) {
            if (cmd != "start")
                cmdList[cmd] = plugin.plugin[cmd];
        }
    }
}
