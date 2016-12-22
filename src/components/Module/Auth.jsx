
module.exports = {
  login(socket,email, pass, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
        this.onChange(true)
      return
    }
    pretendRequest(socket,email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = Math.random().toString(36).substring(7)
        localStorage.name = res.name
        localStorage.uid = res.uid
        if (cb) cb(true)
          this.onChange(true)
      } else {
        if (cb) cb(false)
          this.onChange(false)
      }
    })
  },
  register(socket,email,pass,name, color,cb){
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
        this.onChange(true)
      return
    }
    pretendRegister(socket,email, pass,name, color, (res) => {
      if (res.authenticated) {
        localStorage.token = Math.random().toString(36).substring(7)
        localStorage.name = res.name
        localStorage.uid = res.uid
        if (cb) cb(true)
          this.onChange(true)
      } else {
        if (cb) cb(false)
          this.onChange(false)
      }
    })
  },
  getProfile(socket,uid,cb){

    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      pretendGetProfile(socket,uid,(res) => {
        if(res.process){
          cb({name:res.name,color:res.color,email:res.email,avatar:res.avatar})
        }else{
          cb(false)
        }
      })
    }else{
      cb(false)
    }
  },
  saveProfile(socket,uid,pass,name,avatar,cb){
    cb = arguments[arguments.length - 1]
    pretendSaveProfile(socket,uid,pass,name,avatar, (res) => {
      if (res) {
        localStorage.name = name
        cb(true)
      } else {
        cb(false)
      }
    })
  },saveAvatar(socket,uid,file,cb){
    cb = arguments[arguments.length - 1]
    pretendSaveAvatar(socket,uid,file, (res) => {
       cb(res)
    })
  },
  getToken() {
    return localStorage.token
  },

  logout(cb) {
    delete localStorage.token
    delete localStorage.name
    delete localStorage.uid
    if (cb) cb()
      this.onChange(false)
  },

  loggedIn() {
    return !!localStorage.token
  },

  onChange() {}
}
function pretendGetProfile(socket,uid, cb) {
  socket.emit('user:getProfile', {
    uid:uid
  }, (result) => {
    if(!result) {
      cb({ process: false })
    }else{
      cb({ process: true,name:result['u']['properties']['Name'],color:result['u']['properties']['Color'],email:result['u']['properties']['Email'],avatar:result['u']['properties']['Avatar'] })
    }
  });
}
function pretendSaveProfile(socket,uid,pass,name,avatar, cb) {
  socket.emit('user:saveProfile', {
    uid:uid,
    name:name,
    pass:pass,
    avatar:avatar
  }, (result) => {
    if(!result) {
      cb(false)
    }else{
      cb(true)
    }
  });
}
function pretendSaveAvatar(socket,uid,file, cb) {
  socket.emit('user:saveAvatar', {
    uid:uid,
    file:file,
  }, (result) => {
    cb(result);
  });
}
function pretendRequest(socket,email, pass, cb) {
  socket.emit('user:login', {
    email:email,
    pass:pass
  }, (result) => {
    if(!result) {
      cb({ authenticated: false })
    }else{
      cb({ authenticated: true,name:result['u']['properties']['Name'],uid:result["ID(u)"] })
    }
  });
}

function pretendRegister(socket,email, pass, name, color, cb) {
  socket.emit('user:register', {
    email:email,
    pass:pass,
    name:name,
    color:color,
  }, (result) => {
    if(!result) {
     return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
   }else{
    if(result ==='Error:201'){
     cb({ authenticated: false })
   }else{
    cb({ authenticated: true,name:name,uid:result[0]["ID(u)"] })
  }
}
});
}
