module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var filter = require("./server_script/filter");
	var user = require("./server_script/user");
	var project = require("./server_script/project");
	var card = require("./server_script/card");
	var task = require("./server_script/task");
	var todo = require("./server_script/todo");
	var tag = require("./server_script/tag");
	var comment = require("./server_script/comment");
	var attachment = require("./server_script/attachment");
	var notification = require("./server_script/notification");

	var config = {
		port: 5000,
		neo4jURL: process.env.NEO4JURL ||'0.0.0.0:7474',
		neo4jUSER: process.env.NEO4JUSER ||'neo4j',
		neo4jPASS:  process.env.NEO4JPASS ||'orisma'
	};
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);

	socket.emit('init', {
		welcome:'Hello Orisma Team.'
	});

	filter(socket,db);
	user(socket,db);
	project(socket,db);
	card(socket,db);
	task(socket,db);
	todo(socket,db);
	tag(socket,db);
	comment(socket,db);
	attachment(socket,db);
	notification(socket,db);

	socket.on('disconnect', function () {

	});

};

