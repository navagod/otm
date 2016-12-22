module.exports = {
	getMyProject(socket,id,callback){
		socket.emit(
            'project:mylist',
            {
            	id: id
            },
            (result) => {
				if(!result) {
					callback(false)
				}else{
					callback(result)
				}
			}
        );
	},
	get(socket,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:get', {
			id:id
		}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)

			}
		});
	},
	add(socket,title,detail, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('project:add', {
			uid:localStorage.uid,
			title:title,
			detail:detail,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	save(socket,title,detail,id, uid, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('project:save', {
			id:id,
			title:title,
			detail:detail,
			uid: uid
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	delete(socket,id,uid, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('project:delete', {
			id:id,
			uid: uid
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	getUsers(socket,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('user:list', {}, (result) => {
			if(result && result.length > 0){
				cb(result.filter(cleanArray))
			}else{
				cb(false)
			}
		});
	},
	assignedUser(socket,uid,pid,mode,cb){
		cb = arguments[arguments.length - 1]
		if(mode=="add"){
			socket.emit('project:addAssign', {
				uid:uid,
				pid:pid
			}, (result) => {
				if(!result) {
					cb(false)
				}else{
					cb(result)
				}
			});
		}else{
			socket.emit('project:removeAssign', {
				uid:uid,
				pid:pid
			}, (result) => {
				if(!result) {
					cb(false)
				}else{
					cb(result)
				}
			});
		}
	},
}
