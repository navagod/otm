
module.exports = {
	add(socket,uid,pid,cid,title,sortNum, cb) {
		cb = arguments[arguments.length - 1]
		socket.emit('task:add', {
			uid:uid,
			pid:pid,
			cid:cid,
			sortNum:sortNum,
			title:title,
			at_create:new Date().getTime()
		}, (result) => {
			if(!result) {
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
				cb(result)
			}
		});
	},
	get(socket,pid,tid,cb){
		console.log(pid,tid)
		cb = arguments[arguments.length - 1]
		socket.emit('task:get', {pid:pid,tid:tid}, (result) => {
			if(!result){
				cb(false)
			}else{
				console.log(result)
				cb(result)
			}
		});
	},
}