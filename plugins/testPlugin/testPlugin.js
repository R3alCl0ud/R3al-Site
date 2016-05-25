"use strict";

var Plugin = require('../../lib/Plugin');
var chatHandler = require('../examplePlugin/lib/chatHandler');

class testPlugin extends Plugin {
    constructor(name, author, version) {
        super(name);
        this.name = name;
        this.author = author;
        this.version = version;
    }
}

module.exports = new testPlugin("Another Test Plugin", "R3alCl0ud & ZachAttack101", "1.0.0");