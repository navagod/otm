module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var config = {
		port: 5000,
		neo4jURL: '0.0.0.0:32769',
		neo4jUSER: 'neo4j',
		neo4jPASS:  '1234'
	};
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
	var boardList = [];
	var lists = [];
	var cards = [];
	var users = [];
	var md5 = require('js-md5');
	function timeConverter(date){
		var today = new Date(parseInt(date));
		var dd = today.getDate();
		var mm = today.getMonth()+1;

		var yyyy = today.getFullYear();
		if(dd<10){
			dd='0'+dd
		} 
		if(mm<10){
			mm='0'+mm
		} 
		var today = yyyy+'-'+mm+'-'+dd;
		return today;
	};
	socket.emit('init', {
		welcome:'Hello Orisma Team.'
	});


//project============//
socket.on('project:listArr',function(data,rs){

	db.cypher({
		query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name,u.Avatar',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			boardList = [];
			results.forEach(function(item,index){
				var project_id = item['ID(p)'];
				var user = {
						user_name:item['u.Name'],
						user_avatar:item['u.Avatar']
					};
				if(typeof boardList[project_id] == "undefined"){ 
				// 	// Todo push member to project
				// 	boardList[project_id]["m"].push(user);

				// }else{
					// Todo create new index	
					boardList[project_id] = {
						d:{
							title: item['p']['properties']['title'],
							detail: item['p']['properties']['detail'],
						}
					};
					
				}
				// boardList[project_id]["m"] = [];
				boardList[project_id].push({m:user});


				// boardList.push({
				// 	id:item['ID(p)'],
				// 	title:item['p']['properties']['title'],
				// 	detail:item['p']['properties']['detail'],
				// 	uid:item['ID(u)'],
				// });
			});
			rs(boardList);
		}
	});
});
socket.on('project:list',function(data,rs){

	db.cypher({
		query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name,u.Avatar',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			boardList = [];
			results.forEach(function(item,index){
				boardList.push({
					id:item['ID(p)'],
					title:item['p']['properties']['title'],
					detail:item['p']['properties']['detail'],
					uid:item['ID(u)'],
					user_name:item['u.Name'],
					user_avatar:item['u.Avatar']
				});
			});
			rs(boardList);
		}
	});
});
socket.on('project:get',function(data,rs){
	db.cypher({
		query:'MATCH (p:Projects) WHERE ID(p) = '+data.id+' OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN p,ID(u),u.Name,u.Avatar',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			rs(results);
		}else{
			rs(false);
		}
	});
});

socket.on('project:add', function (data,fn) {
	db.cypher({
		query: 'MATCH (m:Users) WHERE ID(m) = '+data.uid+' CREATE (p:Projects {title:"'+data.title+'",detail:"'+data.detail+'",status:"active"}) CREATE (p)<-[:CREATE_BY {date:"'+data.at_create+'"}]-(m)  RETURN ID(p)'
	}, function (err, results) {
		if (err){ console.log(err); fn(false); }else{
			db.cypher({
				query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name,u.Avatar',
			},function(err,results){
				if (err) console.log(err);
				if(results){
					boardList = [];
					results.forEach(function(item,index){
						boardList.push({id:item['ID(p)'],title:item['p']['properties']['title'],detail:item['p']['properties']['detail'],uid:item['ID(u)'],user_name:item['u.Name'],user_avatar:item['u.Avatar']});
					});
					socket.broadcast.emit('project:updateAddList', {
						list:boardList
					});
				}
			});
			fn(results);
		}
	});
});

socket.on('project:save', function (data,fn) {
	db.cypher({
		query: 'MATCH (p:Projects) WHERE ID(p) = '+data.id+' SET p.title = "'+data.title+'",p.detail = "'+data.detail+'" RETURN p'
	}, function (err, results) {
		if (err) console.log(err);

		db.cypher({
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name,u.Avatar',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				boardList = [];
				results.forEach(function(item,index){
					boardList.push({id:item['ID(p)'],title:item['p']['properties']['title'],detail:item['p']['properties']['detail'],uid:item['ID(u)'],user_name:item['u.Name'],user_avatar:item['u.Avatar']});
				});
				socket.broadcast.emit('project:updateEditProject', {
					pid:data.id,
					list:boardList
				});
			}
		});
		fn(true);
	});
});

socket.on('project:addAssign', function (data,fn) {
	db.cypher({
		query: 'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (p:Projects) WHERE ID(p) = '+data.pid+' CREATE (u)-[a:Assigned]->(p) RETURN ID(p),u.Name,u.Avatar'
	}, function (err, results) {
		if (err){ console.log(err); fn(false); }else{
			socket.broadcast.emit('project:updateAddAssign', {
				pid:data.pid,
				id: data.uid,
				name: results[0]['u.Name'],
				avatar: results[0]['u.Avatar']
			});
			fn(results);
		}
	});
});
socket.on('project:removeAssign', function (data,fn) {
	db.cypher({
		query: 'MATCH a=(u:Users)-[r:Assigned]->(p:Projects) WHERE ID(u) = '+data.uid+' AND ID(p) = '+data.pid+' DELETE r'
	}, function (err, results) {
		if (err){ console.log(err); fn(false); }else{
			socket.broadcast.emit('project:updateRemoveAssign', {
				pid:data.pid,
				id: data.uid
			});
			fn(results);
		}
	});
});
//project============//


//card===============//
socket.on('card:add',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (p:Projects) WHERE ID(p) = '+data.pid+' CREATE (c:Cards {title:"'+data.title+'",color:"black",icon:"info_outline",position:'+data.sortNum+'}) CREATE (u)-[:CREATE_BY {date:"'+data.at_create+'"}]->(c)-[:LIVE_IN]->(p) RETURN ID(c)',
	},function(err,results){
		if (err) {
			console.log(err);
		}else{
			socket.broadcast.emit('card:updateAddList', {
				pid:data.pid,
				lists:{id:results[0]['ID(c)'],
				title: data.title,
				color: "black",
				icon: "info_outline",
				position: data.sortNum}
			});
			rs(results);
		}
	});
});
socket.on('card:list',function(data,rs){
	db.cypher({
		query:'MATCH (p:Projects) WHERE ID(p) = '+data.pid+' AND p.status = "active" OPTIONAL MATCH (c:Cards)-[r:LIVE_IN]->(p) RETURN p.title,ID(c),c ORDER BY c.position ASC',
	},function(err,results){
		if (err) {console.log(err); rs(false);}else{

			if(results){
				lists = [];
				if(results[0]['c']){
					results.forEach(function(item,index){
						lists.push({id:item['c']['_id'],title:item['c']['properties']['title'],color:item['c']['properties']['color'],icon:item['c']['properties']['icon'],position:item['c']['properties']['position']});
					});
				}
				rs({board:results[0]['p.title'],lists:lists});
			}
		}
	});
});

socket.on('card:sortlist', function (data,fn) {
		// console.log(data);
		var process_query = true;
		data.lists.forEach(function(value,index){
			db.cypher({
				query: 'MATCH (c:Cards)-[r:LIVE_IN]->(p:Projects) WHERE ID(p) = '+data.pid+'  AND ID(c) = '+value.id+' SET c.position = '+value.position+' RETURN ID(c)'
			}, function (err, results) {
				if (err){
					console.log(err);
					process_query = false;
				}
			});
		});
		if(process_query) {
			socket.broadcast.emit('card:updateSort', {
				pid:data.pid,
				lists:data.lists 
			});
			fn(true);
		}else{
			fn(false);
		}
	});
socket.on('card:get',function(data,rs){
	db.cypher({
		query:'MATCH (c:Cards) WHERE ID(c) = '+data.id+'  RETURN c LIMIT 1',
	},function(err,results){
		if (err) console.log(err);
		console.log(results);
		if(results){
			rs(results[0]['c']['properties']);
		}else{
			rs(false);
		}
	});
});
socket.on('card:save', function (data,fn) {
	db.cypher({
		query: 'MATCH (c:Cards) WHERE ID(c) = '+data.id+' SET c.title = "'+data.title+'",c.color = "'+data.color+'",c.icon = "'+data.icon+'" RETURN c'
	}, function (err, results) {
		if (err) console.log(err);
		socket.broadcast.emit('card:updateEditCard', {
			id:data.id,
			title: data.title,
			color: data.color,
			icon: data.icon,
			position: data.position
		});
		fn(true);
	});
});
//card===============//

//Task===============//
socket.on('task:add',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (p:Projects) WHERE ID(p) = '+data.pid+' MATCH (c:Cards) WHERE ID(c) = '+data.cid+' CREATE (t:Tasks {title:"'+data.title+'",duedate:"",detail:"",position:'+data.sortNum+'}) CREATE (u)-[:CREATE_BY {date:"'+data.at_create+'"}]->(t)-[:LIVE_IN]->(c) CREATE (t)-[:LIVE_IN]->(p) CREATE (cm:Comments {text:"Create task by "+u.Name,date:"'+data.at_create+'",type:"log"}) CREATE (u)-[:Comment]->(cm)-[:IN]->(t) RETURN ID(t)',
	},function(err,results){
		if (err) {
			console.log(err);
		}else{
			socket.broadcast.emit('task:updateAddTaskList', {
				pid:data.pid,
				lists:{
					id:results[0]['ID(t)'],
					title:data.title,
					detail:"",
					position:data.sortNum,
					duedate:"",
					pid:data.pid,
					cid:data.cid,
					total_comment:0,
					total_task:"0/0",
					user_avatar:"",
					user_name:"",
					tags:"",
					tags_color:""
				}
			});
			rs(results);
		}
	});
});
socket.on('task:list',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)-[n:LIVE_IN]->(c:Cards)-[n2:LIVE_IN]->(p:Projects)  WHERE ID(c) = '+data.cid+' OPTIONAL MATCH (u:Users)-[cb:Assigned]->(t) OPTIONAL  MATCH (cm:Comments)-[in:IN]->(t) WHERE cm.type <> "log"  OPTIONAL  MATCH (lb:Labels)-[in:IN]->(t)  OPTIONAL  MATCH (td:Todos)-[in:IN]->(t) OPTIONAL  MATCH (tdc:Todos)-[in:IN]->(t) WHERE tdc.status="success" RETURN u.Name,u.Avatar,ID(t) AS tid,t.title,t.position,t.duedate,t.detail,COUNT(ID(cm)) AS total_comment,lb.Title as tag_name,lb.Color as tag_color,ID(p) AS pid,ID(c) AS cid,COUNT(ID(td)) AS total_todo,COUNT(ID(tdc)) AS todo_success ORDER BY t.position ASC',
	},function(err,results){
		if (err) console.log(err);
		var res = [];
		if(results[0]){
			results.forEach(function(value,index){
				var push_arr = 
				{
					id:value['tid'],
					title:value['t.title'],
					detail:value['t.detail'],
					position:value['t.position'],
					duedate:value['t.duedate'],
					pid:value['pid'],
					cid:value['cid'],
					total_comment:value['total_comment'],
					total_task:value['total_todo'] +"/"+value['todo_success'],
					user_avatar:value['u.Avatar'],
					user_name:value['u.Name'],
					tags:value['tag_name'],
					tags_color:value['tag_color']
				}


				res.push(push_arr);
			});
		}
			// console.log(res);
			rs(res);
		});
});




//Task===============//
/*socket.on('list:join_boards',function(data,rs){

	db.cypher({
		query:'MATCH (u:User {id:"'+data.id+'"})-[j:JOIN]->(b:Board)  RETURN ID(b),b',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			boardList = [];
			results.forEach(function(item,index){
				boardList.push({id:item['ID(b)'],title:item['b']['properties']['title']});
			});
			rs(boardList);
		}
	});
});

socket.on('add:list', function (data,fn) {
	db.cypher({
		query: 'MATCH (u:Users) WHERE u.id = "'+data.uid+'" MATCH (b:Board) WHERE ID(b) = '+data.bid+' CREATE (l:List {title:"'+data.name+'",position:'+data.sort+'}) CREATE (l)-[:CREATE_BY {date:"'+data.at_create+'"}]->(u),(l)-[:LIVE_IN]->(b)  RETURN ID(l)'
	}, function (err, results) {
		if (err) fn(false);
		fn(results[0]['ID(l)']);
	});
});
socket.on('list:lists',function(data,rs){
	db.cypher({
		query:'MATCH (b:Board)-[c:CREATE_BY]->(u:Users) WHERE ID(b) = '+data.boardId+' OPTIONAL MATCH (l:List)-[r:LIVE_IN]->(b) RETURN b.title,ID(l),l ORDER BY l.position',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			lists = [];
			if(results[0]['l']){
				results.forEach(function(item,index){
					lists.push({id:item['l']['_id'],title:item['l']['properties']['title'],position:item['l']['properties']['position']});
				});
			}
			rs({board:results[0]['b.title'],lists:lists});
		}
	});
});
socket.on('sort:list', function (data,fn) {
		// console.log(data);
		var process_query = true;
		data.lists.forEach(function(value,index){
			db.cypher({
				query: 'MATCH (l:List)-[r:LIVE_IN]->(b:Board)-[c:CREATE_BY]->(u:User {id:"'+data.uid+'"}) WHERE ID(b) = '+data.bid+'  AND ID(l) = '+value.id+' SET l.position = '+value.position+' RETURN ID(l)'
			}, function (err, results) {
				if (err){
					console.log(err);
					process_query = false;
				}
			});
		});
		if(process_query) fn(true);
	});

socket.on('list:card',function(data,rs){
	db.cypher({
		query:'MATCH (c:Card)-[n:LIVE_IN]->(l:List)-[n2:LIVE_IN]->(b:Board) WHERE ID(b) = '+data.bid+' RETURN c,ID(l) ORDER BY c.position ASC',
	},function(err,results){
		if (err) console.log(err);
		var res = [];
		if(results[0]){
			results.forEach(function(value,index){
				var push_arr = {
					list_id:value['ID(l)'],data:
					{
						id:value['c']['_id'],
						title:value['c']['properties']['title'],
						description:value['c']['properties']['description'],
						position:value['c']['properties']['position'],
						start_date:value['c']['properties']['start_date'],
						end_date:value['c']['properties']['end_date']
					}
				};

				res.push(push_arr);
			});
		}
			// console.log(res);
			rs(res);
		});
});
socket.on('get:card',function(data,rs){

	db.cypher({
		query:'MATCH (c:Card) WHERE ID(c) = '+data.cid+' OPTIONAL MATCH (u:Users)-[j:JOIN]->(c) RETURN c,u',
	},function(err,results){
		if (err) console.log(err);
		if(results[0]){
			var data;
			var mem = [];
			var fullmem = [];
			results.forEach(function(v,i){
				data = v['c']['properties'];
				if(v['u']){
					mem.push(v['u']['properties']['id']);
					fullmem.push({id:v['u']['properties']['id'],fullName:v['u']['properties']['fullName'],avatar:v['u']['properties']['avatar'],email:v['u']['properties']['email']});
				}
			});
			rs({data:data,joinMember:mem,joinMemberFull:fullmem});
		}else{
			rs(false);
		}
	});
});
socket.on('delete:card',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users)<-[p:CREATE_BY]-(c:Card)-[i:LIVE_IN]->(l:List) WHERE id(c) = '+data.cid+' OPTIONAL MATCH (c)<-[ic:LIVE_IN]-(cm:Comment)-[pc:CREATE_BY]->(u)  DELETE p,i,ic,pc,cm,c',
	},function(err,results){
		if (err) console.log(err);
		rs(true);
	});
});
socket.on('save:card',function(data,rs){
	var query = 'MATCH (c:Card) WHERE ID(c) = ' + data.cid;
	switch(data.cmd) {
		case 'title':
		query += ' SET c.title = "'+data.data.title+'" RETURN ID(c)';
		break;
		case 'desc':
		query += ' SET c.detail = "'+data.data.detail+'" RETURN ID(c)';
		break;
		case 'date':
		query += ' SET c.start_date = "'+data.data.start+'", c.end_date = "'+data.data.end+'" RETURN ID(c)';
		break;
		case 'drop':
		query += ' MATCH (u:Users)<-[cr:CREATE_BY]-(c)  MATCH (u2:Users) WHERE u2.firstName = "'+data.data.user+'" DELETE cr CREATE (c)-[c3:CREATE_BY {at_create:"'+new Date().getTime()+'"}]->(u2) SET c.start_date = "'+data.data.start+'", c.end_date = "'+data.data.end+'" RETURN ID(c)';
		break;
		case 'member':
		if(data.data.typeAction=='add'){
			query += ' MATCH (u:User {id:"'+data.data.uid+'"}) CREATE (u)-[j:JOIN]->(c) RETURN u';
		}else{
			query += ' MATCH (u:User {id:"'+data.data.uid+'"})-[j:JOIN]->(c) DELETE j RETURN ID(u)';
		}
		break;
	}
	db.cypher({
		query:query,
	},function(err,results){
		if (err) console.log(err);
		if(results[0]){
			if(data.cmd==='member' && data.data.typeAction=='add'){
				rs({id:results[0]['u']['properties']['id'],fullName:results[0]['u']['properties']['fullName'],avatar:results[0]['u']['properties']['avatar'],email:results[0]['u']['properties']['email']});
			}else{
				rs(true);
			}

		}else{
			rs(false);
		}
	});
});
socket.on('add:comment',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users) WHERE u.id = "'+data.uid+'" MATCH (l:Card) WHERE ID(l) = '+data.cid+' CREATE (c:Comment {message:"'+data.data+'"}) CREATE (u)<-[:CREATE_BY {date:"'+data.at_create+'"}]-(c)-[:LIVE_IN]->(l) RETURN ID(c),u.firstName,u.id',
	},function(err,results){
		if (err) console.log(err);
		rs(results[0]);
	});
});
socket.on('delete:comment',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users)<-[p:CREATE_BY]-(c:Comment)-[i:LIVE_IN]->(l:Card) WHERE u.id = "'+data.uid+'" AND ID(c)='+data.cid+' DELETE p,c,i',
	},function(err,results){
		if (err) console.log(err);
		rs(true);
	});
});
socket.on('list:comment',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users)<-[a:CREATE_BY]-(c:Comment)-[n:LIVE_IN]->(l:Card) WHERE ID(l) = '+data.cid+' RETURN u.firstName,u.id,c,a.date ORDER BY a.date ASC',
	},function(err,results){
		if (err) console.log(err);
		var res = [];
		if(results[0]){
			results.forEach(function(value,index){
				var push_arr = {
					comment_id:value['c']['_id'],
					message:value['c']['properties']['message'],
					uid:value['u.id'],
					user:value['u.firstName'],
					at_create:value['a.date']
				};
				res.push(push_arr);
			});
		}
		rs(res);
	});
});
socket.on('list:members',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users) RETURN u',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			var userList = [];
			results.forEach(function(item,index){
				userList.push({id:item['u']['properties']['id'],avatar:item['u']['properties']['avatar'],fullName:item['u']['properties']['fullName'],email:item['u']['properties']['email'],firstName:item['u']['properties']['firstName']});
			});
			rs(userList);
		}
	});
});
socket.on('list:events',function(data,rs){
	db.cypher({
		query:'MATCH (u2:Users)<-[uc:CREATE_BY]-(c:Card)-[n:LIVE_IN]->(l:List)-[n2:LIVE_IN]->(b:Board) WHERE ID(b) = '+data.bid+' RETURN c,u2.firstName',
	},function(err,results){
		if (err) console.log(err);
		var cardList = [];
		results.forEach(function(item,index){
			if(item['c']){
				var timeDiff = Math.abs(item['c']['properties']['end_date'] - item['c']['properties']['start_date']);
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

				cardList.push({
					id:item['c']['_id'].toString(),
					title:item['c']['properties']['title'],
					duration:diffDays,
					startDate:timeConverter(item['c']['properties']['start_date']),
					resource:item['u2.firstName']
				});
			}
		});
		rs({events:cardList});
	});
});*/

	//users============//
	socket.on('user:register',function(data,rs){
		db.cypher({
			query:'MATCH (e:Users) WHERE e.Email = "'+data.email+'" RETURN e.Email',
		},function(err,results){
			if (err) console.log('Register Error',err);
			if(results){
				if(results.length == 0){
					db.cypher({
						query:'CREATE (u:Users{Email:"'+data.email+'",Name:"'+data.name+'",Pass:"'+md5(data.pass)+'",Avatar:""}) RETURN ID(u)',
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
		db.cypher({
			query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET u.Name = "'+data.name+'", u.Pass = "'+md5(data.pass)+'" RETURN u',
		},function(err,results){
			if (err) console.log('Save Profile Error : ',err);
			if(results){
				rs(true)
			}else{
				rs(false)
			}
		});
	});
	socket.on('user:list',function(data,rs){

		db.cypher({
			query:'MATCH (u:Users) RETURN ID(u) AS uid,u.Name AS name,u.Avatar AS avatar',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				users = [];
				results.forEach(function(item,index){
					users.push({id:item['uid'],name:item['name'],avatar:item['avatar']});
				});
				rs(users);
			}
		});
	});
	//users============//
	socket.on('disconnect', function () {
		
	});
};