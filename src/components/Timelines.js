import React, { Component } from 'react';
import {Link} from 'react-router';
import auth from './Module/Auth';
import Timeline from 'react-calendar-timeline'
import moment from 'moment'
const socket = io.connect();
import CM from './Module/Carlenda'
var _ = require('lodash')

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
			currentPid:0
		}
		
	}
	componentDidMount(){
		CM.listProject((rs)=>{
			if(!rs){

			}else{
				this.setState({projectList:rs})
			}
		})

		socket.on('task:updateEndTime', this._updateEndTime.bind(this));
	}
	selectProject(item){
		CM.listTask(item.d.id,(rs)=>{
			if(!rs){

			}else{
				var ac = [],uc = []
				rs.forEach(function(v,i){
					if(!v.group){
						uc.push({
							group:v.group,
							id:v.id,
							title:v.title,
							start_time:moment.unix(Math.round(parseInt(v.start_time) / 1000)),
							end_time:moment.unix(Math.round(parseInt(v.end_time) / 1000)),
							canMove: true,
							canResize: true,
							canChangeGroup: true,
							status:v.status,
							itemsSorted: true,
							itemTouchSendsClick: false,
							stackItems: true,
							itemHeightRatio: 0.75,
						})
					}else{
						ac.push({
							group:v.group,
							id:v.id,
							title:v.title,
							start_time:moment.unix(Math.round(parseInt(v.start_time) / 1000)),
							end_time:moment.unix(Math.round(parseInt(v.end_time) / 1000)),
							canMove: true,
							canResize: true,
							canChangeGroup: true,
							status:v.status,
							itemsSorted: true,
							itemTouchSendsClick: false,
							stackItems: true,
							itemHeightRatio: 0.75,
						})
					}
				})
			}
			this.setState({currentPid:item.d.id,userList:item.m,taskUnsignList:uc,taskAssignList:ac})
		})
	}

	_updateEndTime(data){
		var items = data.list.filter(cleanArray)
		var {projectList} = this.state
		projectList = items
		var index = _.findIndex(items,{'d':{'id':this.state.currentPid}})
		this.setState({projectList})
		this.selectProject(items[index])

	}
	resizeItem(id,time){
		CM.changeEndTime(this.state.currentPid,id,time,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}
		})
	}

	activeProject(id){

		if(this.state.currentPid == id){
			return "btn-select-project active"
		}else{
			return "btn-select-project"
		}
	}
	moveItem(itemId, dragTime, newGroupOrder){
		CM.changePosition(this.state.currentPid,itemId,dragTime,newGroupOrder,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}
		})
	}
	render() {
		var items = this.state.projectList;
		return (
			<div>
			<div id="project-list">
			<div id="btn-all-project">All Projects</div>
			{ items.map((item, i) => 
				<div className={this.activeProject(item.d.id)} onClick={this.selectProject.bind(this,item)} key={"list-project-"+i}><i className="material-icons tiny">library_books</i> {item.d.title}</div>
				)}
			</div>
			<Timeline groups={this.state.userList}
			items={this.state.taskAssignList}
			defaultTimeStart={moment().add(-12, 'hour')}
			defaultTimeEnd={moment().add(12, 'hour')}
			onItemResize={this.resizeItem.bind(this)}
			onItemMove={this.moveItem.bind(this)}
			/>
			<div>
			
			</div>
			<div id="unassigned"></div>
			</div>

			)
	}
}

export default Timelines;