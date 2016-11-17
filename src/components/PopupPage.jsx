import React, { Component } from 'react'
import {Link} from 'react-router'
import {Button, Dropdown,NavItem} from 'react-materialize'
import Tasks from './Module/Task'
class PopupPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			projectId:this.props.params.projectId,
			taskId:this.props.params.taskId,
			taskData:[],
			socket:this.props.socket
		}
	}
	componentDidMount(){
		Tasks.get(this.state.socket,this.state.projectId,this.state.taskId,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด ไม่พบ Task นี้", 4000)
			}else{
				var {taskData} = this.state
				taskData = rs
				this.setState({taskData})
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
			<textarea className="hiddenInput title" defaultValue="If true, the dropdown will open on hover. Default: false"></textarea>
			<textarea className="hiddenInput detail" defaultValue="If true, the dropdown will open on hover. Default: false" placeholder="No detail."></textarea>
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
			<div className="activity-item">
			<div className="activity-avatar">
			A
			</div>
			<div className="activity-detail">
			bla bal bla
			</div>
			</div>
			<div className="activity-item">
			<div className="activity-avatar">
			A
			</div>
			<div className="activity-detail">
			bla bal bla
			</div>
			</div>

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
