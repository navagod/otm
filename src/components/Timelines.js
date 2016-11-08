import React, { Component } from 'react';
import {Link} from 'react-router';
import auth from './Module/Auth';
import Timeline from 'react-calendar-timeline'
import moment from 'moment'
const socket = io.connect();
import CM from './Module/Carlenda'
var _ = require('lodash')
// const groups = [
// {id: 1, title: 'group 1'},
// {id: 2, title: 'group 2'}
// ]

// const items = [
// {id: 1, group: 1, title: 'item 1', start_time: moment(), end_time: moment().add(1, 'hour')},
// {id: 2, group: 2, title: 'item 2', start_time: moment().add(-0.5, 'hour'), end_time: moment().add(0.5, 'hour')},
// {id: 3, group: 1, title: 'item 3', start_time: moment().add(2, 'hour'), end_time: moment().add(3, 'hour')}
// ]

class Timelines extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:"",
			projectList:[],
			userList:[],
			taskUnsignList:[],
			taskAssignList:[],
			currentPid:""
		}
		
	}
	componentDidMount(){
		CM.listProject((rs)=>{
			if(!rs){

			}else{
				this.setState({projectList:rs})
			}
		})
	}
	selectProject(id){
		var item = this.state.projectList
		var arrs = groupBy(item, function(item)
		{
			return [item.id];
		});
console.log(item)
		if(id=="all"){

		}else{

		}
	}
	render() {
		var items = this.state.projectList;
		var arrs = groupBy(items, function(item)
		{
			return [item.id];
		});

		return (
			<div>
			<div id="project-list">
			<div id="btn-all-project" onClick={this.selectProject.bind(this,"all")}>All Projects</div>
			{ arrs.map((item, i) => 
				<div className="btn-select-project" onClick={this.selectProject.bind(this,item[0].id)} key={i}><i className="material-icons tiny">library_books</i> {item[0].title}</div>
				)}
			</div>
			
			<div id="unassigned"></div>
			</div>

			)
	}
}

export default Timelines;