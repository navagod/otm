const socket = io.connect();
module.exports = {
	add(uid,pid,cid,title,sortNum, cb) {
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
				cb(true)
			}
		});
	},
	list(cid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:list', {cid:cid}, (result) => {
			if(result){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
}