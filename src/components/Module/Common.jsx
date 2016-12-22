module.exports = {
	countNotification(socket,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('notification:count', {uid:localStorage.uid}, (result) => {
			if(!result && result !==0){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	listNotification(socket,offset,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('notification:lists', {uid:localStorage.uid,offset:offset}, (result) => {
			if(!result){
				cb(false)
			}else{
				if (typeof result[0] !== 'undefined' && result[0] !== null) {
					cb(result)
				}else{
					cb(false)
				}
			}
		});
	},
	clickNotification(socket,id,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('notification:readed', {id:id}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
	readNotification(socket,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('notification:allreaded', {uid:localStorage.uid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},
}
