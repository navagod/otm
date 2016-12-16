module.exports = {
	update(socket,project_id,card_id,task_id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:move', {
			project_id: project_id,
			card_id: card_id,
			task_id: task_id
		}, (result) => {
			console.log(result);
			if(result){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
}
