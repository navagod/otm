module.exports = function (socket,db) {
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
		query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar,u.Color',
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
					user_avatar:item['u.Avatar'],
					user_color:item['u.Color']
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
		query:'MATCH (p:Projects) WHERE ID(p) = '+data.id+' OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN p,ID(u),u.Name,u.Avatar,u.Color',
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
				query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar,u.Color',
			},function(err,results){
				if (err) console.log(err);
				if(results){
					boardList = [];
					results.forEach(function(item,index){
						boardList.push({id:item['ID(p)'],title:item['p']['properties']['title'],detail:item['p']['properties']['detail'],uid:item['ID(u)'],user_name:item['u.Name'],user_avatar:item['u.Avatar'],user_color:item['u.Color']});
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
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar,u.Color',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				boardList = [];
				results.forEach(function(item,index){
					boardList.push({id:item['ID(p)'],title:item['p']['properties']['title'],detail:item['p']['properties']['detail'],uid:item['ID(u)'],user_name:item['u.Name'],user_avatar:item['u.Avatar'],user_color:item['u.Color']});
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
			query:'MATCH (p:Projects) WHERE p.status = "active" OPTIONAL MATCH (u:Users)-[a:Assigned]->(p) WHERE ID(u)<>0 RETURN ID(p),p,ID(u),u.Name,u.Avatar,u.Color',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				boardList = [];
				results.forEach(function(item,index){
					boardList.push({id:item['ID(p)'],title:item['p']['properties']['title'],detail:item['p']['properties']['detail'],uid:item['ID(u)'],user_name:item['u.Name'],user_avatar:item['u.Avatar'],user_color:item['u.Color']});
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
		query: 'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (p:Projects) WHERE ID(p) = '+data.pid+' CREATE (u)-[a:Assigned]->(p) RETURN ID(p),u.Name,u.Avatar,u.Color'
	}, function (err, results) {
		if (err){ console.log(err); fn(false); }else{
			//notification
			if(parseInt(data.uuid) != parseInt(data.uid)){
				db.cypher({
					query: 'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (p:Projects) WHERE ID(p) = '+data.pid+' CREATE (n:Notification {Type:"project" ,date:"'+ new Date().getTime() +'",title:u.Name + " Assigned to " + p.title,detail:p.detail,readed:"no",pid:ID(p)}) CREATE (n)-[:TO {date:"'+ new Date().getTime() +'"}]->(u) RETURN n'
				}, function (err, rs_notify) {
					if (err){
						console.log(err);
					}else{
						socket.broadcast.emit('notify:updateCount', {
							uid:data.uid
						});
					}
				});
			}

			//===
			socket.broadcast.emit('project:updateAddAssign', {
				pid:data.pid,
				id: data.uid,
				name: results[0]['u.Name'],
				avatar: results[0]['u.Avatar'],
				color: results[0]['u.Color']
			});
			fn({id: data.uid,name: results[0]['u.Name'],avatar: results[0]['u.Avatar'],color: results[0]['u.Color']});
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
};

