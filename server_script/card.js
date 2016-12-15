module.exports = function (socket,db) {
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
};

