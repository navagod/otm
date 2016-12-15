module.exports = function (socket,db) {
	var fs = require('fs');

	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + s4();
	}
//Attachment====///
	socket.on('attachment:list',function(data,rs){
		db.cypher({
			query:'MATCH (u:Users)-[:Attachment]->(a:Attachment)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,u.Color,a.file_name,ID(a) as id,a.date,a.file_type ORDER BY ID(a) DESC',
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
					query:'MATCH (u:Users) WHERE ID(u) = '+data.uid+' MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' MATCH (us:Users)-[:Assigned]->(t) CREATE (a:Attachment {date:"'+data.at_create+'",file_name:"'+file_name+'",file_type:"' + data.file_ext + '"}) CREATE (u)-[:Attachment]->(a)-[:IN]->(t) RETURN a,ID(us)',
				},function(err,result){
					if (err){ console.log(err);
						rs(false)
					}else{
						db.cypher({
							query:'MATCH (u:Users)-[:Attachment]->(a:Attachment)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,u.Color,a.file_name,ID(a) as id,a.date,a.file_type ORDER BY ID(a) DESC',
						},function(err,rs_attachment){
							if (err){ console.log(err);
								rs(false)
							}else{
								//notify
								if(parseInt(data.uid) !== parseInt(result[0]['ID(us)'])){
									db.cypher({
										query: 'MATCH (u:Users) WHERE ID(u) = '+result[0]['ID(us)']+' MATCH (t:Tasks) WHERE ID(t) = '+data.tid+' CREATE (n:Notification {Type:"comment" ,date:"'+ new Date().getTime() +'",title:"'+result[0]['u.Name']+' Attachment",detail:"'+data.text+'",readed:"no",tid:ID(t)}) CREATE (n)-[:TO {date:"'+ new Date().getTime() +'"}]->(u) RETURN n'
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
							query:'MATCH (u:Users)-[:Attachment]->(a:Attachment)-[:IN]->(t:Tasks) WHERE ID(t) = '+data.tid+' RETURN u.Name,u.Avatar,u.Color,a.file_name,ID(a) as id,a.date,a.file_type ORDER BY ID(a) DESC',
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
};

