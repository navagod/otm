const socket = io.connect();
module.exports = {
	listProject(cb){
		cb = arguments[arguments.length - 1]
		socket.emit('project:listArr', {}, (result) => {
			if(result && result.length > 0){
				cb(result)
			}else{
				cb(false)
			}
		});
	},
	listUser(pid,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('user:listByProject', {pid:pid}, (result) => {
			if(result && result.length > 0){
				cb(result)
			}else{
				cb(false)
			}
		});
	}
}