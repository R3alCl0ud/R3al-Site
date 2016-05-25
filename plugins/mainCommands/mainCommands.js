"use strict";

var Plugin = require('../../lib/Plugin');
var chatHandler = require('./lib/chatHandler');

class examplePlugin extends Plugin {

    constructor(name, author, version) {
        super(name);
        this.name = name;
        this.author = author;
        this.version = version;
    }
    
    getName() {
        return this.name;
    }
}



module.exports = new examplePlugin("Main Commands", "R3alCl0ud & ZachAttack101", "1.0.1");