module.exports = {
	update(socket,project_id,card_id,task_id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:changeSort', {
			tid:task_id,
			cid:card_id,
			parent: false,
			after: false,
			mode: false
		}, (result) => {
			if(result){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
}
