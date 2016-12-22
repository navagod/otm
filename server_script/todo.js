module.exports = function (socket,db) {
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
socket.on('todo:sorted',function(data,fn){
	var process_query = true;
	data.items.forEach(function(value,index){
		db.cypher({
			query: 'MATCH (t:Todos) WHERE ID(t) = '+value['ID(td)']+' SET t.position = '+value['td.position']+' RETURN ID(t)'
		}, function (err, results) {
			if (err){
				console.log(err);
				process_query = false;
			}else{
				if(process_query) {
					socket.broadcast.emit('todo:updateSort', {
						tid:data.id,
						lists:data.items
					});
					fn(true);
				}else{
					fn(false);
				}
			}
		});
	});
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
};

