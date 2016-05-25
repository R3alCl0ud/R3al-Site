"use strict";

// cmd ID 0 is a reserved ID;
exports.cmds = [];

exports.Command = class  {
    // use var x = new command(<name>, <desc>); (auto-assign ID)
    constructor(name, desc, func) {
        this.name = name;   // set cmd name
        this.desc = desc;   // set cmd description
        this.func = func;   // set cmd function
        this.cmdlet = exports.cmds.length; // sets the cmd id
        exports.cmds.push(this);
    }
    setCMD()
    {
        return this.cmdlet;
    }
}