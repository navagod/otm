module.exports = {
	listProject(socket,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:listArr', {}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	listTask(socket,pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:listByProject', {pid:pid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	changeEndTime(socket,pid,tid,time,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:changeEndTime', {
			pid:pid,
			tid:tid,
			time:time,
			uid:localStorage.uid
		}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	changePosition(socket,pid,tid,time_start,time_end,group,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:changePosition', {
			pid:pid,
			tid:tid,
			time_start:time_start,
			time_end:time_end,
			new_uid:group,
			uid:localStorage.uid
		}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	}
}
