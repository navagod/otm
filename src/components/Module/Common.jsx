module.exports = {
	countNotification(socket,cb){
		cb = arguments[arguments.length - 1]
		socket.emit('notification:count', {uid:localStorage.uid}, (result) => {
			if(!result){
				cb(false)
			}else{
				cb(result)
			}
		});
	},

}
