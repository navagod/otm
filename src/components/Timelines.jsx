import React, { Component } from 'react'
import {Link} from 'react-router'
import auth from './Module/Auth'
import Timeline from 'react-calendar-timeline'
import moment from 'moment'
import CM from './Module/Carlenda'
var _ = require('lodash')



class Timelines extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			errorMsg:"",
			projectList:[],
			userList:[],
			taskAssignList:[],
			currentPid:0
		}

	}
	componentDidMount(){
		CM.listProject((rs)=>{
			if(!rs){

			}else{
				rs.sort(function (a, b) {
					if (a.d.id > b.d.id) {
						return 1;
					}
					if (a.d.id < b.d.id) {
						return -1;
					}
					return 0;
				});
				this.setState({projectList:rs})
			}
		})
    let socket = this.props.socket
		socket.on('task:updateEndTime', this._updateEndTime.bind(this))
	}
	componentWillUnmount() {
		this.setState({projectList:[],
			userList:[],
			taskAssignList:[],
			currentPid:0})
	}

	selectProject(item){
		CM.listTask(item.d.id,(rs)=>{
			if(!rs){

			}else{
				var ac = [],uc = []
				rs.forEach(function(v,i){
					ac.push({
						group:v.group,
						id:v.id,
						title:v.title,
						start_time:moment.unix(Math.round(parseInt(v.start_time) / 1000)),
						end_time:moment.unix(Math.round(parseInt(v.end_time) / 1000)),
						canMove: true,
						canResize: true,
						canChangeGroup: true,
						className:v.status
					})

				})
			}
			item.m.sort(function (a, b) {
				if (a.id > b.id) {
					return 1;
				}
				if (a.id < b.id) {
					return -1;
				}
				return 0;
			});
			this.setState({currentPid:item.d.id,userList:item.m,taskAssignList:ac})

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
	moveItem(itemId, data){
		CM.changePosition(this.state.currentPid,itemId,data.start_time,data.end_time,data.group,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}
		})
	}

	render() {
		var items = this.state.projectList

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
				stackItems={true}
				dragSnap={60 * 60 * 1000}

				/>
				<div>

				</div>
				<div id="unassigned"></div>
				</div>

				)
	}
}

export default Timelines