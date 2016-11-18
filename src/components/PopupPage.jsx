import React, { Component } from 'react'
import {Link} from 'react-router'
import {Button, Dropdown,NavItem} from 'react-materialize'
import Tasks from './Module/Task'
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
				console.log(rs)
				var {taskData} = this.state
				taskData = rs["task"][0]
				this.setState({taskData,projectId:rs[0]["task"]["ID(p)"],comments:rs["comments"]})
				this.props.onRender(rs[0]["task"]["ID(p)"])
			}
		})
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
			<textarea className="hiddenInput title" value={this.state.taskData["t.title"]}></textarea>
			<textarea className="hiddenInput detail" value={this.state.taskData["t.detail"]} placeholder="No detail."></textarea>
			<div id="todoList">
			<div className="addSubject"><i className="material-icons">note_add</i> Add Checklist Itme</div>
			</div>
			<div id="fileList">
			<div className="addSubject"><i className="material-icons">note_add</i> Attachment</div>
			</div>
			<div id="activity">
			<h5>Activity</h5>
			<div id="inputComment">
			<form>
			<textarea type="text" className="inputComment" placeholder="Enter comment" required/>
			<button type="submit" className="btn-flat green right">Say it!</button>
			</form>
			<div className="clear"></div>
			</div>

			{ this.state.comments.map((c_item,ic)=>
				<div className="activity-item">
				<div className="activity-avatar">

				</div>
				<div className="activity-detail">
				<div>Posted : {timeConverter(c_item["c.date"])}</div>
				{c_item["c.text"]}
				</div>
				</div>
				)}
			
			<div>
			
			</div>
			</div>
			</div>
			<div className="col s4 bg-gray">
			<div className="rightBarItem">
			<strong>Start Date : </strong> 11/11/2016<br/>
			<strong>Due Date : </strong> 12/11/2016<br/>
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
