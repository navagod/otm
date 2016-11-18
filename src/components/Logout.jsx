import React, { Component } from 'react';
import auth from './Module/Auth';
import Redirect from 'react-router/Redirect'
class Logout extends Component {
	componentDidMount() {
		auth.logout()
		
	}
	render() {
		return <Redirect to="/login"/>
	}
}
export default Logout;
