var tempTaskCount = new Array();
module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var config = {
		port: 5000,
		neo4jURL: process.env.NEO4JURL ||'0.0.0.0:7474',
		neo4jUSER: process.env.NEO4JUSER ||'neo4j',
		neo4jPASS:  process.env.NEO4JPASS ||'orisma'
	};
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
	var boardList = [];
	var lists = [];
	var cards = [];
	var users = [];
	var md5 = require('js-md5');
	var fs = require('fs');
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
	function timeConverter(UNIX_timestamp){
		var a = new Date(UNIX_timestamp * 1000);
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getHours();
		var min = a.getMinutes();
		var sec = a.getSeconds();
		var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
		return time;
	}

	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + s4();
	}

//project============//
socket.on('project:listArr',function(data,rs){

	db.cypher({
		query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p)  RETURN ID(p),p,ID(u),u.Name',
	},function(err,results){
		if (err) console.log(err);
		if(results){
			boardList = []
			results.forEach(function(item,index){
				var project_id = item['ID(p)'];
				if(typeof boardList[project_id] == "undefined" || !boardList[project_id]){
					boardList[project_id] = {
						d:{
							id: project_id,
							title: item['p']['properties']['title'],
							detail: item['p']['properties']['detail'],
						},
						m:[]
					};

				}
				boardList[project_id]['m'].push({
					id:item['ID(u)'],
					title:item['u.Name']
				});
			});
			rs(boardList);
		}
	});
});
socket.on('project:list',function(data,rs){
	db.cypher({
		query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar',
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
socket.on('project:getTaskCount',function(data,rs){
	var data1 = db.cypher({
		query:"MATCH (t:Tasks)-->(p:Projects) WHERE id(p) = "+data.pid+" RETURN t.status as status,count(t) as count",
	},function (err,res) {
		var return_data = {};
		for (var i in res) {
			return_data[res[i].status] = res[i].count;
		}
		rs(return_data);
	});
	//rs({active:1,archive:2,trash:3});
});
socket.on('project:get',function(data,rs){
	db.cypher({
		query:'MATCH (p:Projects) WHERE ID(p) = '+data.id+' OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN p,ID(u),u.Name,u.Avatar',
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
		query: 'MATCH (m:Users) WHERE ID(m) = '+data.uid+' MATCH (u:Users) WHERE ID(u) = 0 CREATE (p:Projects {title:"'+data.title+'",detail:"'+data.detail+'",status:"active"}) CREATE (p)<-[:CREATE_BY {date:"'+data.at_create+'"}]-(m) CREATE (u)-[:Assigned]->(p) RETURN ID(p)'
	}, function (err, results) {
		if (err){ console.log(err); fn(false); }else{
			db.cypher({
				query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar',
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
					fn({list:boardList});
				}else{
					fn([])
				}
			});

		}
	});
});

socket.on('project:save', function (data,fn) {
	db.cypher({
		query: 'MATCH (p:Projects) WHERE ID(p) = '+data.id+' SET p.title = "'+data.title+'",p.detail = "'+data.detail+'" RETURN p'
	}, function (err, results) {
		if (err) console.log(err);

		db.cypher({
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar',
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
			fn(boardList);
		});

	});
});

socket.on('project:delete', function (data,fn) {
	db.cypher({
		query: 'MATCH (p:Projects) WHERE ID(p) = '+data.id+' SET p.status = "disabled" RETURN p'
	}, function (err, results) {
		if (err) console.log(err);

		db.cypher({
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar',
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
			fn(boardList);
		});

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
			fn({id: data.uid,name: results[0]['u.Name'],avatar: results[0]['u.Avatar']});
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
			rs({
				pid:data.pid,
				lists:{id:results[0]['ID(c)'],
				title: data.title,
				color: "black",
				icon: "info_outline",
				position: data.sortNum}
			});
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
				try{
					if(results[0]['c']){
						results.forEach(function(item,index){
							lists.push({id:item['c']['_id'],title:item['c']['properties']['title'],color:item['c']['properties']['color'],icon:item['c']['properties']['icon'],position:item['c']['properties']['position']});
						});
					}
					rs({board:results[0]['p.title'],lists:lists});
				}catch(err) {
					console.log(err)
				}
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
				}else{
					if(process_query) {
						socket.broadcast.emit('card:updateSort', {
							pid:data.pid,
							lists:data.lists
						});
						fn(true);
					}else{
						fn(false);
					}
				}
			});
		});

	});
socket.on('card:get',function(data,rs){
	db.cypher({
		query:'MATCH (c:Cards) WHERE ID(c) = '+data.id+'  RETURN c LIMIT 1',
	},function(err,results){
		if (err) console.log(err);
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
		query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (p:Projects) WHERE ID(p) = '+data.pid+' MATCH (c:Cards) WHERE ID(c) = '+data.cid+' MATCH (uz:Users) WHERE ID(uz)=0 CREATE (t:Tasks {title:"'+data.title+'",endDate:"'+(new Date().getTime() + 86400000)+'",startDate:"'+new Date().getTime()+'",detail:"",status:"active"}) CREATE (u)-[:CREATE_BY {date:"'+data.at_create+'"}]->(t)-[:LIVE_IN]->(c) CREATE (t)-[:LIVE_IN {date:"'+data.at_create+'"}]->(p) CREATE (cm:Comments {text:"Create task by "+u.Name,date:"'+data.at_create+'",type:"log"}) CREATE (u)-[:Comment {date:"'+data.at_create+'"}]->(cm)-[:IN {date:"'+data.at_create+'"}]->(t) CREATE (uz)-[:Assigned {date:"'+data.at_create+'"}]->(t) RETURN ID(t)',
	},function(err,results){
		if (err) {
			console.log(err);
		}else{
			if(data.parent){
				db.cypher({
					query:'MATCH (pt:Tasks) WHERE ID(pt) = '+data.parent+' MATCH (t:Tasks) WHERE ID(t) = '+results[0]['ID(t)']+' OPTIONAL MATCH (pt)<-[p]-(:Tasks) DELETE p CREATE (t)-[:Parent]->(pt) RETURN t'
				},function(err,rs_relate){
					if (err) {
						console.log(err);
					}else{
						socket.broadcast.emit('task:updateAddTaskList', {
							pid:data.pid,
							lists:{
								id:results[0]['ID(t)'],
								title:data.title,
								detail:"",
								parent:data.parent,
								duedate:(new Date().getTime() + 86400000),
								pid:data.pid,
								cid:data.cid,
								total_comment:0,
								total_task:"0/0",
								user_avatar:"",
								user_name:"",
								status:"active",
								tags:[{
									'title':null,
									'color':null
								}],
								tags_color:""
							}
						});
						rs({
							pid:data.pid,
							lists:{
								id:results[0]['ID(t)'],
								title:data.title,
								detail:"",
								parent:data.parent,
								duedate:(new Date().getTime() + 86400000),
								pid:data.pid,
								cid:data.cid,
								total_comment:0,
								total_task:"0/0",
								user_avatar:"",
								status:"active",
								user_name:"",
								tags:[{
									'title':null,
									'color':null
								}],
								tags_color:""
							}
						});
					}
				})
			}else{
				socket.broadcast.emit('task:updateAddTaskList', {
					pid:data.pid,
					lists:{
						id:results[0]['ID(t)'],
						title:data.title,
						detail:"",
						parent:data.parent,
						duedate:(new Date().getTime() + 86400000),
						pid:data.pid,
						cid:data.cid,
						total_comment:0,
						total_task:"0/0",
						user_avatar:"",
						status:"active",
						user_name:"",
						tags:[{
							'title':null,
							'color':null
						}],
						tags_color:""
					}
				});
				rs({
					pid:data.pid,
					lists:{
						id:results[0]['ID(t)'],
						title:data.title,
						detail:"",
						parent:data.parent,
						duedate:(new Date().getTime() + 86400000),
						pid:data.pid,
						cid:data.cid,
						total_comment:0,
						total_task:"0/0",
						user_avatar:"",
						status:"active",
						user_name:"",
						tags:[{
							'title':null,
							'color':null
						}],
						tags_color:""
					}
				});
			}
		}
	});
});
socket.on('task:list',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)-[n:LIVE_IN]->(c:Cards)-[n2:LIVE_IN]->(p:Projects)  WHERE ID(c) = '+data.cid+' AND t.status <> "archive" AND t.status <> "trash" OPTIONAL MATCH (u:Users)-[cb:Assigned]->(t) OPTIONAL  MATCH (cm:Comments)-[in1:IN]->(t) WHERE cm.type <> "log"  OPTIONAL  MATCH (lb:Labels)-[in4:IN]->(t)  OPTIONAL  MATCH (td:Todos)-[in2:IN]->(t) OPTIONAL  MATCH (tdc:Todos)-[in3:IN]->(t) WHERE tdc.status="success" RETURN u.Name,u.Avatar,ID(t) AS tid,t.title,t.position,t.endDate,t.detail,t.status,count(distinct cm) AS total_comment,lb.text as tag_name,lb.color as tag_color,ID(p) AS pid,ID(c) AS cid,count(distinct td) AS total_todo,count(distinct tdc) AS todo_success ORDER BY t.position ASC',
	},function(err,results){
		if (err) console.log(err);
		var res = [];
		if(results){
			for (var k in results) {
				var id = results[k]['tid'];
				if (res[id] === undefined) {
					res[id] = {
						'id': id,
						"title": results[k]['t.title'],
						"detail": results[k]['t.detail'],
						"position": results[k]['t.position'],
						"duedate": results[k]['t.endDate'],
						"pid": results[k]['pid'],
						"cid": results[k]['cid'],
						"total_comment": results[k]['total_comment'],
						"total_task": results[k]['todo_success']+"/"+results[k]['total_todo'],
						"user_avatar": results[k]['u.Avatar'],
						"user_name": results[k]['u.Name'],
						"status": results[k]['t.status'],
						"tags": []
					}
				}
				res[id]['tags'].push({
					'title':results[k]['tag_name'],
					'color':results[k]['tag_color']
				})
			};
		}
		rs(res);
	});
});

socket.on('task:listUpdate',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)-[n:LIVE_IN]->(c:Cards)-[n2:LIVE_IN]->(p:Projects)  WHERE ID(c) = '+data.cid+' AND t.status <> "archive" AND t.status <> "trash" OPTIONAL MATCH (u:Users)-[cb:Assigned]->(t) OPTIONAL  MATCH (cm:Comments)-[in1:IN]->(t) WHERE cm.type <> "log"  OPTIONAL  MATCH (lb:Labels)-[in4:IN]->(t)  OPTIONAL  MATCH (td:Todos)-[in2:IN]->(t) OPTIONAL  MATCH (tdc:Todos)-[in3:IN]->(t) WHERE tdc.status="success" RETURN u.Name,u.Avatar,ID(t) AS tid,t.title,t.position,t.endDate,t.detail,t.status,count(distinct cm) AS total_comment,lb.Title as tag_name,lb.Color as tag_color,ID(p) AS pid,ID(c) AS cid,count(distinct td) AS total_todo,count(distinct tdc) AS todo_success ORDER BY t.position ASC',
	},function(err,results){
		if (err) console.log(err);
		let res = [];
		if(results){
			for (var k in results) {
				var id = results[k]['tid'];
				if (res[id] === undefined) {
					res[id] = {
						'id': id,
						"title": results[k]['t.title'],
						"detail": results[k]['t.detail'],
						"position": results[k]['t.position'],
						"duedate": results[k]['t.endDate'],
						"pid": results[k]['pid'],
						"cid": results[k]['cid'],
						"total_comment": results[k]['total_comment'],
						"total_task": results[k]['todo_success']+"/"+results[k]['total_todo'],
						"user_avatar": results[k]['u.Avatar'],
						"user_name": results[k]['u.Name'],
						"status": results[k]['t.status'],
						"tags": []
					}
				}
				res[id]['tags'].push({
					'title':results[k]['tag_name'],
					'color':results[k]['tag_color']
				})
			};
		}

		rs(res);
		socket.broadcast.emit('task:reUpdateList', {
			cid:data.cid,
			lists:res
		})
	});
});

socket.on('task:listByProject',function(data,rs){
	db.cypher({
		query:'MATCH (p:Projects)<-[l:LIVE_IN]-(t:Tasks) WHERE ID(p) = '+data.pid+' OPTIONAL MATCH (u:Users)-[a:Assigned]->(t) RETURN ID(t),t.title,t.startDate,t.endDate,t.status,ID(u)',
	},function(err,results){
		if (err) console.log(err);
		var res = [];
		if(results){
			results.forEach(function(item,index){
				res.push({
					group:item['ID(u)'],
					id:item['ID(t)'],
					title:item['t.title'],
					start_time:item['t.startDate'],
					end_time:item['t.endDate'],
					status:item['t.status']
				})
			});
			rs(res);
		}else{
			rs(false);
		}
	});
});

socket.on('task:changeEndTime', function (data,fn) {
	db.cypher({
		query: 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' SET t.endDate = "'+data.time+'" RETURN t'
	}, function (err, results) {
		if (err) console.log(err);

		db.cypher({
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name',
		},function(err,results_sub){
			if (err) console.log(err);
			if(results_sub){
				boardList = []
				results_sub.forEach(function(item,index){
					var project_id = item['ID(p)'];
					if(typeof boardList[project_id] == "undefined" || !boardList[project_id]){
						boardList[project_id] = {
							d:{
								id: project_id,
								title: item['p']['properties']['title'],
								detail: item['p']['properties']['detail'],
							},
							m:[]
						};

					}
					boardList[project_id]['m'].push({
						id:item['ID(u)'],
						title:item['u.Name']
					});
				});
				socket.broadcast.emit('task:updateEndTime', {
					pid:data.pid,
					list:boardList
				});
			}
		});


		fn(true);
	});
});

socket.on('task:changePosition', function (data,fn) {

	var sql = 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (u:Users)-[a:Assigned]->(t) MATCH (u2:Users) WHERE ID(u2) = '+data.new_uid+' DELETE a CREATE (u2)-[:Assigned]->(t) SET t.startDate = "'+data.time_start+'", t.endDate = "'+data.time_end+'" RETURN t'
	db.cypher({
		query: sql
	}, function (err, results_process) {
		if (err) console.log(err);

		db.cypher({
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) RETURN ID(p),p,ID(u),u.Name',
		},function(err,results_sub){
			if (err) console.log(err);
			if(results_sub){
				boardList = []
				results_sub.forEach(function(item,index){
					var project_id = item['ID(p)'];
					if(typeof boardList[project_id] == "undefined" || !boardList[project_id]){
						boardList[project_id] = {
							d:{
								id: project_id,
								title: item['p']['properties']['title'],
								detail: item['p']['properties']['detail'],
							},
							m:[]
						};

					}
					boardList[project_id]['m'].push({
						id:item['ID(u)'],
						title:item['u.Name']
					});
				});
				socket.broadcast.emit('task:updateEndTime', {
					pid:data.pid,
					list:boardList
				});
			}
		});
		fn(true);
	});

});
socket.on('task:get',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (uc:Users)-[:CREATE_BY]->(t) MATCH (p:Projects)<-[:LIVE_IN]-(t) OPTIONAL MATCH (ua:Users)-[:Assigned]->(t) WHERE ID(ua) <> 0 AND ID(t) = '+data.tid+' OPTIONAL MATCH (td:Todos)-[:IN]->(t) RETURN t.title,t.detail,t.startDate,t.endDate,t.status,uc.Name,uc.Avatar,ua.Name,ua.Avatar,ID(ua),ID(p),p.title,COUNT(distinct td) AS todo',
	},function(err,results){
		if (err) console.log(err);
		if(!results || err){
			rs(false)
		}else{

			rs(results)
		}
	})
});
socket.on('task:save',function(data,rs){

	db.cypher({
		query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' SET t.title = "'+data["data"]["t.title"]+'",t.detail = "'+data["data"]["t.detail"]+'",t.startDate = "'+data["data"]["t.startDate"]+'",t.endDate = "'+data["data"]["t.endDate"]+'",t.status = "'+data["data"]["t.status"]+'" RETURN t',
	},function(err,results){
		if (err) console.log(err);
		if(!results || err){
			rs(false)
		}else{
			rs(results)
		}
	})
});
socket.on('task:setStartDate',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' MATCH (p:Projects)<-[:LIVE_IN]-(t) MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET t.startDate = "'+data.time+'"  RETURN t',
	},function(err,results){
		if (err) console.log(err);
		if(!results || err){
			rs(false)
		}else{
			rs(results)
		}
	})
});
socket.on('task:setEndDate',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' MATCH (p:Projects)<-[:LIVE_IN]-(t) MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET t.endDate = "'+data.time+'" RETURN t',
	},function(err,results){
		if (err) console.log(err);
		if(!results || err){
			rs(false)
		}else{
			rs(results)
		}
	})
});
socket.on('task:assignUser',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (u2:Users)-[a:Assigned]-(t) DELETE a CREATE (u)-[:Assigned]->(t) RETURN t',
	},function(err,results){
		if (err) console.log(err);
		if(!results || err){
			rs(false)
		}else{
			rs(results)
		}
	})
});
socket.on('task:changeStatus',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)  WHERE ID(t) = '+data.tid+' SET t.status = "'+data.status+'" RETURN t',
	},function(err,results){
		if (err) console.log(err);
		if(!results || err){
			rs(false)
		}else{
			rs(results)
		}
	})
});
socket.on('task:changeSort',function(data,rs){
	data.items.map((v,i)=>
		db.cypher({
			query:'MATCH (t:Tasks) WHERE ID(t) = '+v+' MATCH (t)-[n:LIVE_IN]->(c:Cards) SET t.position = '+i+' DELETE n  RETURN t',
		},function(err,results){
			if (err) console.log(err);
			if(!results || err){
				rs(false)
			}else{
				db.cypher({
					query:'MATCH (t:Tasks) WHERE ID(t) = '+v+'  MATCH (c:Cards) WHERE ID(c) = '+data.cid+' MERGE (t)-[:LIVE_IN]->(c)  RETURN t',
				},function(err,rs_create){
					if (err) console.log(err);
					if(!rs_create || err){
						rs(false)
					}else{
						rs(true)
					}
				})
			}
		})

		)

});
//Task===============//

//Todo============//
socket.on('todo:list',function(data,rs){
	db.cypher({
		query:'MATCH (td:Todos)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN ID(td),td.text,td.status,td.position ORDER BY td.position ASC',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('todo:add',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' CREATE (td:Todos {text:"'+data.text+'",position:'+data.position+',status:""}) CREATE (td)-[:IN]->(t) RETURN ID(td)',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('todo:status',function(data,rs){
	db.cypher({
		query:'MATCH (t:Todos) WHERE ID(t) = '+data.id+' SET t.status = "'+data.status+'" RETURN ID(t)',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('todo:delete',function(data,rs){
	db.cypher({
		query:'MATCH (td:Todos) WHERE ID(td) = '+data.id+' MATCH (td)-[n:IN]->(t:Tasks) DELETE n DELETE td RETURN td',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('todo:edit',function(data,rs){
	db.cypher({
		query:'MATCH (td:Todos) WHERE ID(td) = '+data.id+' SET td.text = "'+data.text+'" RETURN td',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
//Todo============//

//Tags ===========//
socket.on('tag:list',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels)-[:IN]->(p:Projects) WHERE ID(p) = '+data.pid+' RETURN ID(t),t.text,t.color',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('tag:add',function(data,rs){
	db.cypher({
		query:'MATCH (p:Projects) WHERE ID(p) = '+data.pid+' CREATE (t:Labels {text:"'+data.text+'",color:"'+data.color+'"}) CREATE (t)-[:IN]->(p) RETURN ID(t)',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('tag:setColor',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels) WHERE ID(t) = '+data.tid+' SET t.color="'+data.color+'" RETURN ID(t)',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('tag:delete',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels) WHERE ID(t) = '+data.id+' MATCH (t)-[n:IN]->() DELETE n DELETE t RETURN t',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('tag:edit',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels) WHERE ID(t) = '+data.id+' SET t.text = "'+data.text+'" RETURN t',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('tag:current',function(data,rs){
	db.cypher({
		query:'MATCH (t:Tasks)<-[:IN]-(l:Labels)  WHERE ID(t) = '+data.tid+' RETURN ID(l),l.text,l.color',
	},function(err,result_labels){
		if (err) console.log(err);
		if(!result_labels || err){
			rs(false)
		}else{
			rs(result_labels)
		}
	})

})
socket.on('tag:assign',function(data,rs){
	let sql = ''
	if(data.mode=='add'){
		sql = 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (l:Labels) WHERE ID(l)='+data.id+' CREATE (l)-[n:IN]->(t) RETURN t'
	}else{
		sql = 'MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (l:Labels) WHERE ID(l)='+data.id+' MATCH (l)-[n:IN]->(t) DELETE n RETURN t'
	}
	db.cypher({
		query:sql,
	},function(err,result_labels){
		if (err) console.log(err);
		if(!result_labels || err){
			rs(false)
		}else{
			rs(result_labels)
		}
	})

})
//Tags ===========//

//Comments====//

socket.on('comment:list',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users)-[:Comment]->(c:Comments)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,c.text,c.date,c.type ORDER BY ID(c) DESC',
	},function(err,rs_comment){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(rs_comment)
		}
	})
});

socket.on('comment:add',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' CREATE (c:Comments {date:"'+data.at_create+'",text:"'+data.text+'",type:"user"}) CREATE (u)-[:Comment]->(c)-[:IN]->(t) RETURN c',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			db.cypher({
				query:'MATCH (u:Users)-[:Comment]->(c:Comments)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,c.text,c.date,c.type ORDER BY ID(c) DESC',
			},function(err,rs_comment){
				if (err){ console.log(err);
					rs(false)
				}else{
					rs(rs_comment)
				}
			})
		}
	})
});

//comments====///


//Attachment====///
socket.on('attachment:list',function(data,rs){
	db.cypher({
		query:'MATCH (u:Users)-[:Attachment]->(a:Attachment)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,a.file_name,ID(a) as id,a.date,a.file_type ORDER BY ID(a) DESC',
	},function(err,rs_attachment){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(rs_attachment)
		}
	})
});

socket.on('attachment:add',function(data,rs){
	var Files = {};
	var dir_file = "dist/uploads/attachment/";
	var file_name = guid() + "." + data.file_ext;
	var full_path_name = dir_file + file_name;
	if (!fs.existsSync(dir_file)) {
        fs.mkdir(dir_file, 0777, function(e) {})
    }
	fs.writeFile(full_path_name, data.file, 'binary', function(err) {
        if (err){
        	console.log('Save Avatar Error : ',err);
        	rs("");
        }else{
			db.cypher({
				query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' CREATE (a:Attachment {date:"'+data.at_create+'",file_name:"'+file_name+'",file_type:"' + data.file_ext + '"}) CREATE (u)-[:Attachment]->(a)-[:IN]->(t) RETURN a',
			},function(err,result){
				if (err){ console.log(err);
					rs(false)
				}else{
					db.cypher({
						query:'MATCH (u:Users)-[:Attachment]->(a:Attachment)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,a.file_name,ID(a) as id,a.date,a.file_type ORDER BY ID(a) DESC',
					},function(err,rs_attachment){
						if (err){ console.log(err);
							rs(false)
						}else{
							rs(rs_attachment)
						}
					})
				}
			})
        }
    });
});

socket.on('attachment:delete',function(data,rs){
	var Files = {};
	var dir_file = "dist/uploads/attachment/";
	var file_name = data.file_name;
	var full_path_name = dir_file + file_name;
	var attachment_id = data.attachment_id;
	fs.unlink(full_path_name, function(err) {
        if (err){
        	console.log('Save Avatar Error : ',err);
        	rs("");
        }else{
			db.cypher({
				query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (a:Attachment) WHERE ID(a) = '+attachment_id+' DETACH DELETE a',
			},function(err,result){
				if (err){ console.log(err);
					rs(false)
				}else{
					db.cypher({
						query:'MATCH (u:Users)-[:Attachment]->(a:Attachment)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,a.file_name,ID(a) as id,a.date,a.file_type ORDER BY ID(a) DESC',
					},function(err,rs_attachment){
						if (err){ console.log(err);
							rs(false)
						}else{
							rs(rs_attachment)
						}
					})
				}
			})
        }
    });
});
//Attachment====///
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
			query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' SET u.Name = "'+data.name+'", u.Pass = "'+md5(data.pass)+'" , u.Avatar = "'+data.avatar+'" RETURN u',
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
			query:'MATCH (u:Users) WHERE ID(u)<>0 RETURN ID(u) AS uid,u.Name AS name,u.Avatar AS avatar',
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
	socket.on('user:listAssign',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users)-[:Assigned]-(p:Projects) WHERE ID(p) = '+data.pid+' RETURN ID(u) AS uid,u.Name AS name,u.Avatar AS avatar ORDER BY ID(u) ASC',
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
