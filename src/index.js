import React from 'react'
import ReactDOM from 'react-dom'
import { Router,Route,IndexRoute,browserHistory} from 'react-router'

import App from './components/App'
import auth from './components/Module/Auth'
import Main from './components/Main'
import Login from './components/Login'
import Logout from './components/Logout'
import Profile from './components/Profile'
import Nopage from './components/Nopage'
import Project from './components/Project'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Register from './components/Register'
import Workload from './components/Workload'
import Timeline from './components/Timelines'
import { createHashHistory,createBrowserHistory } from 'history'


function requireAuth(nextState, replace) {
	if (!auth.loggedIn()) {
		replace({
			pathname: 'login',
			state: { nextPathname: nextState.location.pathname }
		})
	}
}

function norequireAuth(nextState, replace) {
	if (auth.loggedIn()) {
		replace({
			pathname: '/',
			state: { nextPathname: nextState.location.pathname }
		})
	}
}

ReactDOM.render(
	(<Router history={browserHistory}>
		<Route path="/" component={Navbar}>
		<IndexRoute component={App} />
		<Route path="/dashboard" component={Dashboard} onEnter={requireAuth}/>
		<Route path="/main" component={Main}/>
		<Route path="/login" component={Login} onEnter={norequireAuth}/>
		<Route path="/logout" component={Logout} onEnter={requireAuth}/>
		<Route path="/register" component={Register} onEnter={norequireAuth}/>
		<Route path="/profile" component={Profile} onEnter={requireAuth}/>
		<Route path="/project/:projectId" component={Project}  onEnter={requireAuth}/>
		<Route path="/workload" component={Workload}  onEnter={requireAuth}/>
		<Route path="/timeline" component={Timeline}  onEnter={requireAuth}/>
		<Route path="*" component={Nopage}/>
		</Route>
		</Router>),
	document.getElementById('root')
	)