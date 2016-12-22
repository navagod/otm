module.exports = function (socket,db) {
	var _ = require('lodash')
	function uniqBy(a, key) {
		var seen = new Set();
		return a.filter(item => {
			var k = key(item);
			return seen.has(k) ? false : seen.add(k);
		});
	}

//Comments====//
	socket.on('comment:list',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users)-[:Comment]->(c:Comments)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,u.Color,c.text,c.date,c.type ORDER BY ID(c) DESC',
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
			query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (us:Users)-[:Assigned]->(t) CREATE (c:Comments {date:"'+data.at_create+'",text:"'+data.text+'",type:"user"}) CREATE (u)-[:Comment]->(c)-[:IN]->(t) RETURN c,ID(us),u.Name',
		},function(err,result){
			if (err){ console.log(err);
				rs(false)
			}else{
				db.cypher({
					query:'MATCH (u:Users)-[:Comment]->(c:Comments)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN ID(u),u.Name,u.Avatar,u.Color,c.text,c.date,c.type ORDER BY ID(c) DESC',
				},function(err,rs_comment){
					if (err){ console.log(err);
						rs(false)
					}else{
						if(parseInt(data.uid)!==parseInt(result[0]['ID(us)'])){
							db.cypher({
								query: 'MATCH (u:Users) WHERE ID(u) = '+result[0]['ID(us)']+' MATCH (p:Tasks) WHERE ID(p) = '+data.tid+' CREATE (n:Notification {Type:"comment" ,date:"'+ new Date().getTime() +'",title:"'+result[0]['u.Name']+' post comment",detail:"'+data.text+'",readed:"no",tid:ID(p)}) CREATE (n)-[:TO {date:"'+ new Date().getTime() +'"}]->(u) RETURN n'
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
						var uni = _.uniqBy(rs_comment,'ID(u)')

						uni.forEach(function(item,index){
							if(parseInt(data.uid)!==parseInt(item['ID(u)']) && (parseInt(item['ID(u)'])!==parseInt(result[0]['ID(us)']))){
								db.cypher({
									query: 'MATCH (u:Users) WHERE ID(u) = '+item['ID(u)']+' MATCH (p:Tasks) WHERE ID(p) = '+data.tid+' CREATE (n:Notification {Type:"comment" ,date:"'+ new Date().getTime() +'",title:"'+result[0]['u.Name']+' post comment",detail:"'+data.text+'",readed:"no",tid:ID(p)}) CREATE (n)-[:TO {date:"'+ new Date().getTime() +'"}]->(u) RETURN n'
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
						})
						rs(rs_comment)
					}
				})
			}
		})
	});
//comments====///
};

