const socket = io.connect();
module.exports = {

	add(title,detail, cb) {
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
				cb(true)
			}
		});
	},

	list(cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:list', {}, (result) => {
			if(result && result.length > 0){
				cb(result.filter(cleanArray))
			}else{
				cb(false)
			}
		});
	},
	get(id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:get', {id:id}, (result) => {
			if(!result){
				cb(false)
			}else{
				console.log(result)
				cb(result)
				
			}
		});
	},
	save(title,detail,id, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('project:save', {
			id:id,
			title:title,
			detail:detail
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(true)
			}
		});
	},
	addCard(title,id,sortNum,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:add', {
			uid:localStorage.uid,
			title:title,
			pid:id,
			sortNum:sortNum,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(true)
			}
		});
	},
	listCard(pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:list', {pid:pid}, (result) => {
			if(result){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
	updateCard(pid,data,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:sortlist', {
			lists:data,
			pid:pid
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(true)
			}
		});
	},
	getCard(id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:get', {id:id}, (result) => {
			if(result){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
	saveCard(title,color,icon,position,id, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('card:save', {
			id:id,
			title:title,
			color:color,
			icon:icon,
			position:position
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(true)
			}
		});
	},
	getUsers(cb){
		cb = arguments[arguments.length - 1]
		socket.emit('user:list', {}, (result) => {
			if(result && result.length > 0){
				cb(result.filter(cleanArray))
			}else{
				cb(false)
			}
		});
	},
	assignedUser(uid,pid,mode,cb){
		cb = arguments[arguments.length - 1]
		if(mode=="add"){
			socket.emit('project:addAssign', {
				uid:uid,
				pid:pid
			}, (result) => {
				if(!result) {
					cb(false)
				}else{
					cb(true)
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
					cb(true)
				}
			});
		}
	}
}
