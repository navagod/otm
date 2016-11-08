import React, { Component } from 'react';
import auth from './Module/Auth';
const socket = io.connect();
class Logout extends Component {
	constructor(props) {
		super(props);
	}
	componentDidMount() {
		auth.logout()
		this.props.router.replace('/')
	}
	render() {
		return <p>You are now logged out</p>
	}
}
export default Logout;
