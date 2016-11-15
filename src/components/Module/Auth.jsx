const socket = io.connect();
module.exports = {
  login(email, pass, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
        this.onChange(true)
      return
    }
    pretendRequest(email, pass, (res) => {
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
  register(email,pass,name,cb){
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
        this.onChange(true)
      return
    }
    pretendRegister(email, pass,name, (res) => {
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
  getProfile(uid,cb){

    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      pretendGetProfile(uid,(res) => {
        if(res.process){
          cb({name:res.name,email:res.email})
        }else{
          cb(false)
        }
      })
    }else{
      cb(false)
    }
  },
  saveProfile(uid,pass,name,cb){
    cb = arguments[arguments.length - 1]
    pretendSaveProfile(uid,pass,name, (res) => {
      if (res) {
        localStorage.name = name
        cb(true)
      } else {
        cb(false)
      }
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
function pretendGetProfile(uid, cb) {
  socket.emit('user:getProfile', {
    uid:uid
  }, (result) => {
    if(!result) {
      cb({ process: false })
    }else{
      cb({ process: true,name:result['u']['properties']['Name'],email:result['u']['properties']['Email'] })
    }
  });
}
function pretendSaveProfile(uid,pass,name, cb) {
  socket.emit('user:saveProfile', {
    uid:uid,
    name:name,
    pass:pass
  }, (result) => {
    if(!result) {
      cb(false)
    }else{
      cb(true)
    }
  });
}
function pretendRequest(email, pass, cb) {
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

function pretendRegister(email, pass, name, cb) {
  socket.emit('user:register', {
    email:email,
    pass:pass,
    name:name
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
