import React, { Component } from 'react';
import auth from './Module/Auth';
class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:""
		}
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault()

		const email = this.refs.email.value
		const pass = this.refs.pass.value

		auth.login(this.props.socket,email, pass, (loggedIn) => {
			if (!loggedIn){
				return Materialize.toast("ข้อมูลเข้าสู่ระบบไม่ถูกต้อง", 4000)
			}else{
        window.location.reload()
			}
		})
	}
	render() {
		return (
			<div className="row">
			<div className="col s6 offset-s3">
			<form className="col s12" onSubmit={this.handleSubmit}>
			<div className="text-center"><h3>LOGIN</h3></div>
			<div className="row">
			<div className="input-field col s12">
			<input id="email" ref="email" type="email" className="validate" required />
			<label htmlFor="email">Email</label>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<input id="password" ref="pass" type="password" className="validate" required />
			<label htmlFor="password">Password</label>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<button type="submit" className="waves-effect waves-light btn">Login</button>
			</div>
			</div>
			</form>
			</div>
			</div>

			);
	}
}
Login.contextTypes = {
  router: React.PropTypes.object.isRequired
}

export default Login;
