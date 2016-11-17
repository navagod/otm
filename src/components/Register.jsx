import React, { Component } from 'react';
import auth from './Module/Auth';
class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false
		}
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault()
		const email = this.refs.email.value
		const pass = this.refs.pass.value
		const name = this.refs.name.value
		auth.register(this.props.socket,email, pass, name, (loggedIn) => {
			if (!loggedIn)
				return this.setState({ error: true })
			const { location } = this.props
			if (location.state && location.state.nextPathname) {
				this.props.router.replace(location.state.nextPathname)
			} else {
				this.props.router.replace('/')
			}
		})
	}
	render() {
		{this.state.error && (
					Materialize.toast("อีเมล์นี้ถูกใช้งานแล้ว", 4000)
					)}
		return (

			<div className="row">
			<div className="col s6 offset-s3">
			<form className="col s12" onSubmit={this.handleSubmit}>
			<div className="text-center"><h3>REGISTER</h3></div>
			<div className="row">
			<div className="input-field col s12">
			<input id="email" ref="email" type="email" className="validate" required />
			<label htmlFor="email">Email</label>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<input id="name" ref="name" type="text" className="validate" required />
			<label htmlFor="name">Name</label>
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
			<button type="submit" className="waves-effect waves-light btn">Create Account</button>
			</div>
			</div>
			</form>
			</div>
			</div>

			);
	}
}

export default Register;