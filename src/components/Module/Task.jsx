module.exports = {
	add(socket,uid,pid,cid,title,parent, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('task:add', {
			uid:uid,
			pid:pid,
			cid:cid,
			title:title,
			parent:parent,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	save(socket,data,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:save', {tid:tid,data:data}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	list(socket,cid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:list', {cid:cid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	listUpdate(socket,cid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:listUpdate', {cid:cid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	get(socket,pid,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:get', {pid:pid,tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	listComment(socket,pid,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('comment:list', {tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	addComment(socket,text,tid, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('comment:add', {
			uid:localStorage.uid,
			tid:tid,
			text:text,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	changeStartDate(socket,tid,tm,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:setStartDate', {
			uid:localStorage.uid,
			tid:tid,
			time:tm,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	changeEndDate(socket,tid,tm,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:setEndDate', {
			uid:localStorage.uid,
			tid:tid,
			time:tm,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	listTodo(socket,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('todo:list', {tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	addTodo(socket,tid,text,position,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('todo:add', {tid:tid,text:text,position:position}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	statusTodo(socket,id,status,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('todo:status', {id:id,status:status}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	deleteTodo(socket,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('todo:delete', {id:id}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	editTodo(socket,id,text,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('todo:edit', {id:id,text:text}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	listUsers(socket,pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('user:listAssign', {pid:pid}, (result) => {
			if(result && result.length > 0){
				cb(result.filter(cleanArray))
			}else{
				cb(false)
			}
		});
	},
	assignUser(socket,uid,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:assignUser', {uid:uid,tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	setStatusTask(socket,status,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:changeStatus', {status:status,tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	sortTask(socket,cid,id,parent,mode,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:changeSort', {tid:id,cid:cid,parent:parent,mode:mode}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	currentTag(socket,tid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:current', {tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	allTag(socket,pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:list', {pid:pid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	setTagTask(socket,tid,mode,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('tag:assign', {tid:tid,id:id,mode:mode}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
}
