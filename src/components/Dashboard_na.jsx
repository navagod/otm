import React, { Component } from 'react'
import {Link} from 'react-router'
import projects from './Module/Project'

class Dashboard_na extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listPerson: [],
			listProject: [],
		}
	}

	componentDidMount(){

		projects.getMyProject(this.props.socket,localStorage.uid,(rs)=>{
			if(!rs){
				return Materialize.toast("Empty Project", 4000)
			}else{
				return this.setState({listProject:rs})
			}
		})
	}

	render() {
		var person = this.state.listPerson
		var project = this.state.listProject
	    return (
	    	<div className="Dashboard_na">
	    		<div>
	    			Hello, { localStorage.name } !!
	    		</div>
	    		<div>
	    		=============================
	    		Project
	    		=============================
	    		{ project.map((item, i) =>
	    			<div key={i} className="project-link-box">
	    				<Link to={`/project/${item.id}`}>
	    					<div className="project-name">{item.title}</div>
	    				</Link>
	    			</div>
	    		)}
	    		</div>
	   		</div>
	  	);
	}
}
export default Dashboard_na;