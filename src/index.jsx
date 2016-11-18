import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Navbar from './components/Navbar'
ReactDOM.render(
	(<Router>
		<Match pattern="/" component={Navbar} />

		</Router>),
	document.getElementById('root')
	)