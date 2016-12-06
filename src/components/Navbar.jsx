import React, { Component } from 'react';
import {Link} from 'react-router';
import auth from './Module/Auth';
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Redirect from 'react-router/Redirect'
import Miss from 'react-router/Miss'


import Dashboard from './Dashboard'
import Project from './Project'
import Login from './Login'
import Logout from './Logout'
import Profile from './Profile'
import Nopage from './Nopage'
import Register from './Register'
import Timeline from './Timelines'
import Common from './Module/Common'

var socket = io.connect()

const MatchWhenAuthorized = ({ component: Component, ...rest }) => (
	<Match {...rest} render={props => (
		auth.loggedIn() ? (
			<Component {...props} {...rest} socket={socket} />
			) : (
			<Redirect to='/login'/>
			)
			)}/>
	)

class Navbar extends Component {
	componentWillMount() {
		this.setState({
			socket: socket,
			notify: 0
		})
	}
	componentDidMount() {
		Common.countNotification(socket,(rs)=>{
			if(!rs){

			}else{
				this.setState({notify:rs})
			}
		})
	}
	render() {
		return (
			<Router>
			{({ router }) => (
				<div>
				<nav className="black" role="navigation" id="navbar">
				<div className="nav-wrapper header"><Link to="/" id="logo-container" className="brand-logo"><img src='/images/otm_logo_white.svg'/></Link>


				{ auth.loggedIn() ?
					<ul className="right hide-on-med-and-down">
					<li><Link to="/timeline"><i className="large material-icons">clear_all</i></Link></li>
					<li><Link to="/profile"><i className="large material-icons">perm_identity</i></Link></li>
					<li className="relative"><a href="#"><i className="large material-icons">info</i> {this.state.notify > 0 &&<span className="notify">{this.state.notify}</span>}</a></li>
					<li><Link to="/logout"><i className="large material-icons">power_settings_new</i></Link></li>
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
				<MatchWhenAuthorized pattern="/" exactly component={Dashboard} />
				<Match pattern="/login" exactly render={({ pathname }) => <Login socket={this.state.socket} /> }/>
				<MatchWhenAuthorized pattern="/logout" exactly component={Logout}/>
				<MatchWhenAuthorized pattern="/profile" exactly component={Profile}/>
				<Match pattern="/Register" exactly render={({ pathname }) => <Register socket={this.state.socket} /> }/>
				<MatchWhenAuthorized pattern="/timeline" exactly component={Timeline}/>
				<MatchWhenAuthorized pattern="/project/:projectId" exactly component={Project} />
				<MatchWhenAuthorized pattern="/task/:taskId" exactly component={Project} />
				<Miss  render={({ pathname }) => <Nopage socket={this.state.socket} /> }/>
				</div>
				</div>
				)}
			</Router>

			)
	}
}
export default Navbar;
