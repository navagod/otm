import React, { Component } from 'react'
import {Link} from 'react-router'
import {Button, Dropdown,NavItem} from 'react-materialize'
import Tasks from './Module/Task'
var Datetime = require('react-datetime');
class PopupPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			projectId:"",
			taskId:this.props.params.taskId,
			taskData:[],
			socket:this.props.socket,
			comments:[]
		}
	}
	componentDidMount(){
		Tasks.get(this.state.socket,this.state.projectId,this.state.taskId,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด ไม่พบ Task นี้", 4000)
			}else{
				var {taskData} = this.state
				taskData = rs[0]
				this.setState({taskData,projectId:rs[0]["ID(p)"]})
				this.props.onRender(rs[0]["ID(p)"])
			}
		})
		Tasks.listComment(this.state.socket,this.state.projectId,this.state.taskId,(rsc)=>{
			if(!rsc){
				
			}else{
				var {comments} = this.state
				comments = rsc
				this.setState({comments})
			}
		})
		console.log(moment(this.state.taskData['startDate']).valueOf())
	}
	changeTitle(event){
		var {taskData} = this.state
		taskData["t.title"] = event.target.value
		this.setState({taskData})
	}
	changeDetail(event){
		var {taskData} = this.state
		taskData["t.detail"] = event.target.value
		this.setState({taskData})
	}
	updateTask(event){
		var v = this.state.taskData["t.title"]
		if(v===""){
			this.refs.taskTitle.focus(); 
			return Materialize.toast("กรุณาใส่ข้อหัว", 4000)
		}else{
			Tasks.save(this.state.socket,this.state.taskData,this.state.taskId,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
				}
			})
		}
	}
	submitComment(event){
		event.preventDefault()
		var c = this.refs.commentInput.value
		if(c===""){
			this.refs.commentInput.focus(); 
			return Materialize.toast("กรุณาใส่ข้อความ", 4000)
		}else{
			Tasks.addComment(this.state.socket,c,this.state.taskId,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
				}else{
					var {comments} = this.state
					comments = rs
					this.setState({comments})
				}
				this.refs.commentInput.value = ""
			})
		}
	}
	validDateStart(current){
		 return current.day() !== 0 && current.day() !== 6;
	}
	validDateEnd(current){
		 return current.day() !== 0 && current.day() !== 6;
	}
	selectStartDate(data){
		console.log(data)
	}
	selectEndDate(data){
		console.log(data)
	}
	render() {
		return (
			<div>
			<div id="inner" className="element-animation">
			<div id="closePopup"><Link to={`/project/${this.state.projectId}`}>×</Link></div>
			<div id="menuPopup">
			<Dropdown trigger={
				<div><i className="material-icons">settings</i></div>
			}>
			<NavItem>Duplicate</NavItem>
			<NavItem>Complete</NavItem>
			<NavItem>Archive</NavItem>
			<NavItem>Trash</NavItem>
			<NavItem divider />
			<NavItem>Copy Link</NavItem>
			</Dropdown>

			</div>
			<div className="clear"></div>
			<hr/>
			<div className="row">
			<div className="col s8">
			<textarea className="hiddenInput title" ref="taskTitle" value={this.state.taskData["t.title"]} onChange={this.changeTitle.bind(this)} onBlur={this.updateTask.bind(this)}></textarea>
			<textarea className="hiddenInput detail" value={this.state.taskData["t.detail"]} onChange={this.changeDetail.bind(this)} placeholder="No detail." onBlur={this.updateTask.bind(this)}></textarea>
			<div id="todoList">
			<div className="addSubject"><i className="material-icons">note_add</i> Add Checklist Itme</div>
			</div>
			<div id="fileList">
			<div className="addSubject"><i className="material-icons">note_add</i> Attachment</div>
			</div>
			<div id="activity">
			<h5>Activity</h5>
			<div id="inputComment">
			<form onSubmit={this.submitComment.bind(this)}>
			<textarea type="text" className="inputComment" ref="commentInput" placeholder="Enter comment" />
			<button type="submit" className="btn-flat green right">Say it!</button>
			</form>
			<div className="clear"></div>
			</div>
			<div id="commetnList">
			{ this.state.comments.map((c_item,ic)=>
				<div className="activity-item" key={"comment-"+this.state.taskId+"-"+ic}>
				<div className="activity-avatar">
			
					{c_item["u.Avatar"]
						? <img  src={"/"+c_item["u.Avatar"]} className="circle responsive-img" width="40" height="40" />
						: <img src={"https://placeholdit.imgix.net/~text?txtsize=15&txt="+c_item["u.Name"].charAt(0).toUpperCase()+"&w=40&h=40&txttrack=0"} className="circle  responsive-img" />
					}

					</div>
					<div className="activity-detail">
					<div>Posted : {timeConverterWithTime(c_item["c.date"])}</div>
					{c_item["c.text"]}
					</div>
					</div>
					)}
			</div>	
			<div>
			
			</div>
			</div>
			</div>
			<div className="col s4 bg-gray">
			<div className="rightBarItem">
			<strong>Start Date : </strong>
			<Datetime isValidDate={this.validDateStart} onChange={this.selectStartDate} value={moment.unix(this.state.taskData['startDate'])} />
			<strong>Due Date : </strong>
			<Datetime isValidDate={this.validDateEnd} onChange={this.selectEndDate} value={moment.unix(this.state.taskData['endDate'])} />
			</div>
			<div className="rightBarItem">
			<strong>Tags</strong>
			</div>
			<div className="rightBarItem">
			<strong>About</strong>
			</div>
			</div>
			
			</div>
			</div>
			<div id="popup" className="fade-animation">
			</div>
			</div>
			);
	}
}
export default PopupPage;
