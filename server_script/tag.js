module.exports = function (socket,db) {
//Tags ===========//
socket.on('tag:list',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels)-[:IN]->(p:Projects) WHERE ID(p) = '+data.pid+' RETURN ID(t),t.text,t.color,t.bg_color,t.f_color',
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
socket.on('tag:setColorCustomBG',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels) WHERE ID(t) = '+data.tid+' SET t.bg_color="'+data.color+'" RETURN ID(t)',
	},function(err,result){
		if (err){ console.log(err);
			rs(false)
		}else{
			rs(result)
		}
	})
});
socket.on('tag:setColorCustomF',function(data,rs){
	db.cypher({
		query:'MATCH (t:Labels) WHERE ID(t) = '+data.tid+' SET t.f_color="'+data.color+'" RETURN ID(t)',
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
		query:'MATCH (t:Tasks)<-[:IN]-(l:Labels)  WHERE ID(t) = '+data.tid+' RETURN ID(l),l.text,l.color,l.bg_color,l.f_color',
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
};

