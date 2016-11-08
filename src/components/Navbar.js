import React, { Component } from 'react';
import {Link} from 'react-router';
import auth from './Module/Auth';

class Navbar extends Component {
	render() {
		return (
			<div>
			<nav className="light-blue lighten-1" role="navigation" id="navbar">
			<div className="nav-wrapper container"><Link to="/" id="logo-container" className="brand-logo">OTM</Link>
			
			
			{ auth.loggedIn() ?
				<ul className="right hide-on-med-and-down">
				<li className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Dashboard"><Link to="/dashboard"><i className="large material-icons">dashboard</i></Link></li>
				<li className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Timeline"><Link to="/timeline"><i className="large material-icons">clear_all</i></Link></li>
				<li className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Work Load"><Link to="/workload"><i className="large material-icons">perm_contact_calendar</i></Link></li>
				<li className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="My Profile"><Link to="/profile"><i className="large material-icons">perm_identity</i></Link></li>
				<li className="relative tooltipped" data-position="bottom" data-delay="50" data-tooltip="Notification"><a href="#"><i className="large material-icons">info</i> <span className="notify">4</span></a></li>
				<li className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Log Out"><Link to="/logout"><i className="large material-icons">power_settings_new</i></Link></li>
				</ul>
				:
				<ul className="right hide-on-med-and-down">
				<li><Link to="register">Register</Link></li>
				<li><Link to="login">Login</Link></li>
				</ul>
			}
			</div>
			</nav>
			<div>
			{this.props.children}
			</div>
			</div>
			);
	}
}

export default Navbar;