const socket = io.connect();
module.exports = {
	listProject(cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:listArr', {}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result.filter(cleanArray))
			}
		});
	},
	listTask(pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:listByProject', {pid:pid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	changeEndTime(pid,tid,time,cb){
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
	changePosition(pid,tid,time,uid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('task:changePosition', {
			pid:pid,
			tid:tid,
			time:time,
			new_uid:time,
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