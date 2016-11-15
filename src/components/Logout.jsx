import React, { Component } from 'react';
import auth from './Module/Auth';
class Logout extends Component {
	componentDidMount() {
		auth.logout()
		this.props.router.replace('/')
	}
	render() {
		return <p>You are now logged out</p>
	}
}
export default Logout;
