module.exports = function (socket,db) {
//Notification
	socket.on('notification:count',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users)<-[:TO]-(n:Notification) WHERE ID(u) = '+data.uid+' AND n.readed = "no" RETURN COUNT(distinct n)',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				rs(results[0]['COUNT(distinct n)']);
			}
		});
	});
	socket.on('notification:lists',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users)<-[:TO]-(n:Notification) WHERE ID(u) = '+data.uid+' RETURN ID(n) AS id, n.Type AS type,n.date AS date,n.title AS title,n.detail AS detail,n.readed AS readed,n.pid AS pid,n.tid AS tid ORDER BY ID(n) DESC SKIP '+data.offset+' LIMIT 8',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				rs(results)
			}else{
				rs(false)
			}
		});
	});
	socket.on('notification:readed',function(data,rs){
		db.cypher({
			query:'MATCH (n:Notification) WHERE ID(n)='+data.id+' SET n.readed = "yes" RETURN n',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				rs(true);
			}
		});
	});
	socket.on('notification:allreaded',function(data,rs){
		db.cypher({
			query:'MATCH (n:Notification)-[:TO]->(u:Users) WHERE ID(u)='+data.uid+' SET n.readed = "yes" RETURN n',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				rs(true);
			}
		});
	});
	//notification
};

