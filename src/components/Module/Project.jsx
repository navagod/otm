module.exports = {

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

	list(socket,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:list', {}, (result) => {
			if(result && result.length > 0){
				cb(result.filter(cleanArray))
			}else{
				cb(false)
			}
		});
	},
	get(socket,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:get', {id:id}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	save(socket,title,detail,id, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('project:save', {
			id:id,
			title:title,
			detail:detail
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	delete(socket,id, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('project:delete', {
			id:id
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	addCard(socket,title,id,sortNum,cb){
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
				cb(result)
			}
		});
	},
	listCard(socket,pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:list', {pid:pid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	updateCard(socket,pid,data,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:sortlist', {
			lists:data,
			pid:pid
		}, (result) => {
			if(!result) {
				cb(false)
			}else{

				cb(result)
			}
		});
	},
	getCard(socket,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('card:get', {id:id}, (result) => {
			if(result){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
	saveCard(socket,title,color,icon,position,id, cb) {
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
				pid:pid,
				uuid:localStorage.uid
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
				pid:pid,
				uuid:localStorage.uid
			}, (result) => {
				if(!result) {
					cb(false)
				}else{
					cb(result)
				}
			});
		}
	},
	getCount(socket,project,cb) {
		socket.emit('project:getTaskCount', {
			pid:project
		}, function (result) {
			cb(result);
		})
	},
	listTag(socket,pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:list', {pid:pid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	addTag(socket,pid,text,color,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:add', {
			text:text,
			pid:pid,
			color:color
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	colorTag(socket,color,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:setColor', {
			tid:tid,
			color:color
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	colorTagCustomBG(socket,custom_bg,tid,cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('tag:setColorCustomBG', {
			tid:tid,
			color:custom_bg
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	colorTagCustomF(socket,custom_bg,tid,cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('tag:setColorCustomF', {
			tid:tid,
			color:custom_bg
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	editTag(socket,id,text,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:edit', {
			id:id,
			text:text
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	deleteTag(socket,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:delete', {
			id:id
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
}
