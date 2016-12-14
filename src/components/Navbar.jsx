import React, { Component } from 'react';
import {Link} from 'react-router';
import auth from './Module/Auth';
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Redirect from 'react-router/Redirect'
import Miss from 'react-router/Miss'


import Dashboard from './Dashboard'
import Project from './Project'
import Filter from './Filter'
import Login from './Login'
import Logout from './Logout'
import Profile from './Profile'
import Nopage from './Nopage'
import Register from './Register'
import Timeline from './Timelines'
import Common from './Module/Common'
import Notification from './Notification'

var socket = io.connect()

const MatchWhenAuthorized = ({ component: Component, ...rest }) => (
	<Match {...rest} render={props => (
		auth.loggedIn() ? (
			<Component {...props} {...rest} socket={socket} />
			) : (
			<Login socket={socket} />
			)
			)}/>
	)

class Navbar extends Component {
	componentWillMount() {
		this.setState({
			socket: socket,
			notify: 0,
			notifyActive:false,
			notifyVisible:false
		})
	}
	componentDidMount() {
		if(auth.loggedIn()){
			Common.countNotification(socket,(rs)=>{
				if(!rs){

				}else{
					this.setState({notify:rs})
				}
			})
		}
		socket.on('notify:updateCount', this.updateNotify.bind(this));
	}
	componentWillUnmount() {

	}
	updateNotify(){
		if(auth.loggedIn()){
			Common.countNotification(socket,(rs)=>{
				if(!rs){

				}else{
					this.setState({notify:rs})
				}
			})
		}
	}
	showNotify(e){
		e.preventDefault()
		this.setState({notifyVisible:true})
		window.addEventListener('click', this._hideNotify.bind(this), false);
	}
	_stopPropagation(e) {
		e.stopPropagation();
	}
	_handleFocus(){
		this.setState({notifyActive:true})
	}
	_handleBlur(){
		this.setState({notifyActive:false})
	}
	_hideNotify(){
		const { notifyActive } = this.state;
		if (!notifyActive) {
			this.setState({notifyVisible:false})
			window.removeEventListener('click', this._hideNotify.bind(this), false);
		}
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
					<li><Link to="/filter"><i className="large material-icons">search</i></Link></li>
					<li className="relative">
						<a href="#" onClick={this.showNotify.bind(this)} onMouseOver={this._handleFocus.bind(this)} onMouseLeave={this._handleBlur.bind(this)}>
							<i className="large material-icons">info</i> {this.state.notify > 0 &&<span className="notify">{this.state.notify}</span>}</a>
						{this.state.notifyVisible&&<div id="modal-notify"><Notification updateNotify={this.updateNotify.bind(this)} socket={socket} onMouseOver={this._handleFocus.bind(this)} onMouseLeave={this._handleBlur.bind(this)} /><div id="overlayTransparent"></div></div>}
					</li>
					<li><Link to="/profile"><i className="large material-icons">perm_identity</i></Link></li>
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
				<MatchWhenAuthorized pattern="/filter" exactly component={Filter} />


				<Miss  render={({ pathname }) => <Nopage socket={this.state.socket} /> }/>
				</div>
				</div>
				)}
			</Router>

			)
	}
}
export default Navbar;
