module.exports = function (socket,db) {
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + s4();
	}

	var md5 = require('js-md5');
	var fs = require('fs');
			//users============//
	socket.on('user:register',function(data,rs){
		db.cypher({
			query:'MATCH (e:Users) WHERE e.Email = "'+data.email+'" RETURN e.Email',
		},function(err,results){
			if (err) console.log('Register Error',err);
			if(results){
				if(results.length == 0){
					db.cypher({
						query:'CREATE (u:Users{Email:"'+data.email+'",Name:"'+data.name+'",Pass:"'+md5(data.pass)+'",Avatar:"",Color:"'+data.color+'"}) RETURN ID(u)',
					},function(err,results_insert){
						if (err) console.log(err);
						if(results_insert){
							rs(results_insert);
						}
					});
				}else{
					rs("Error:201");
				}
			}
		});
	});
	socket.on('user:login',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users) WHERE u.Email = "'+data.email+'" AND u.Pass = "'+md5(data.pass)+'" RETURN u,ID(u)',
		},function(err,results){
			if (err) console.log('Login Error : ',err);
			if(results){
				rs(results[0])
			}else{
				rs(false)
			}
		});
	});
	socket.on('user:getProfile',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' RETURN u',
		},function(err,results){
			if (err) console.log('Get profile Error : ',err);
			if(results){
				rs(results[0])
			}else{
				rs(false)
			}
		});
	});
	socket.on('user:saveProfile',function(data,rs){
		var new_pass = "";
		if(data.pass != ""){
			new_pass = ', u.Pass = "'+md5(data.pass)+'"';
		}

		db.cypher({
			query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET u.Name = "'+data.name+'" '+new_pass+' , u.Avatar = "'+data.avatar+'" RETURN u',
		},function(err,results){
			if (err) console.log('Save Profile Error : ',err);
			if(results){
				rs(true)
			}else{
				rs(false)
			}
		});
	});
	socket.on('user:saveAvatar',function(data,rs){
		var Files = {};
		var dir_file = "dist/uploads/";
		var file_name = guid() + ".jpg";
		var full_path_name = dir_file + file_name;
		if (!fs.existsSync(dir_file)) {
			fs.mkdir(dir_file, 0777, function(e) {})
		}
		fs.writeFile(full_path_name, data.file, 'binary', function(err) {
			if (err){
				console.log('Save Avatar Error : ',err);
				rs("");
			}else{
				rs(file_name);
			}
		});

	});
	socket.on('user:list',function(data,rs){

		db.cypher({
			query:'MATCH (u:Users) WHERE ID(u)<>0 RETURN ID(u) AS uid,u.Name AS name,u.Avatar AS avatar,u.Color AS color',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				users = [];
				results.forEach(function(item,index){
					users.push({id:item['uid'],name:item['name'],avatar:item['avatar'],color:item['color']});
				});
				rs(users);
			}
		});
	});
	socket.on('user:listAssign',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users)-[:Assigned]-(p:Projects) WHERE ID(p) = '+data.pid+' RETURN ID(u) AS uid,u.Name AS name,u.Avatar AS avatar,u.Color AS color ORDER BY ID(u) ASC',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				users = [];
				results.forEach(function(item,index){
					users.push({id:item['uid'],name:item['name'],avatar:item['avatar'],color:item['color']});
				});
				rs(users);
			}
		});
	});
	//users============//
};

