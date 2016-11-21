import React, { Component } from 'react';
import auth from './Module/Auth';
import Redirect from 'react-router/Redirect'
class Logout extends Component {
	componentDidMount() {
		auth.logout()
		this.context.router.transitionTo('/')
	}
	render() {
		return null
	}
}
Logout.contextTypes = {
  router: React.PropTypes.object.isRequired
}

export default Logout;
