module.exports = {
    loadProjectFilter(socket,uid,cb){
        cb = arguments[arguments.length - 1]
        socket.emit('filter:loadProject', {
            uid:uid
        }, (result) => {
            if(!result) {
                cb(false)
            }else{
                cb(result)
            }
        });
    },
    loadUserFilter(socket,uid,cb){
        cb = arguments[arguments.length - 1]
        socket.emit('filter:loadUser', {
            uid:uid
        }, (result) => {
            if(!result) {
                cb(false)
            }else{
                cb(result)
            }
        });
    },
    loadTagFilter(socket,uid,cb){
        cb = arguments[arguments.length - 1]
        socket.emit('filter:loadTags', {
            uid:uid
        }, (result) => {
            if(!result) {
                cb(false)
            }else{
                cb(result)
            }
        });
    },
    loadFilter(socket,filter,cb) {
        cb = arguments[arguments.length - 1]
        socket.emit('filter:loadFilter', {
            filter:filter
        }, (result) => {
            if(!result) {
                cb(false)
            }else{
                cb(result)
            }
        });
    }
}