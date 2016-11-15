import React, { Component } from 'react';
import auth from './Module/Auth';
import {Link} from 'react-router';
import tasks from './Module/Task';
import moment from 'moment';
var _ = require('lodash')

class Task extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:"",
			projectId:this.props.projectId,
			cardId:this.props.cardId,
			openAddTask:false,
			listTasks:[]
		}
	}
	componentDidMount(){
		$( ".sort-task" ).sortable({connectWith: ".sort-task"
	}).disableSelection();

		tasks.list(this.state.cardId,(rs)=>{
			if(!rs){

			}else{
				this.setState({listTasks:rs});
			}
		})
    let socket = this.props.socket
		socket.on('task:updateAddTaskList', this._updateAddTaskList.bind(this));
	}
	componentDidUpdate(prevProps, prevState){

	}
	_updateAddTaskList(data){
		if(data.pid == this.state.projectId && data.lists.cid == this.state.cardId){
			var {listTasks} = this.state;
			listTasks.push(data.lists);
			this.setState({listTasks});
		}
	}
	esc(e){
		if(e.key=="Escape"){
			this.setState({
				openAddTask: false
			})
		}
	}
	openAddTaskDialog(){
		this.setState({openAddTask:true});
	}
	submitAddTask(event){
		event.preventDefault()
		const title = this.refs.addTaskTitle.value
		const sortNum = this.state.listTasks.length + 1
		tasks.add(localStorage.uid,this.state.projectId,this.state.cardId,title,sortNum,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}
			this.setState({
				openAddTask: false
			})
		})
	}
	render() {
		return (
			<div className="sort-task" key={"box-"+this.state.projectId} id={"box-"+this.state.projectId}>
			{ this.state.listTasks.map((task_item, i) =>
				<div className="task-box" id={"task-"+task_item.id} key={i}>
				<Link to="#">
				<div className="task-assign">
				{task_item.user_name && task_item.user_avatar ?
					<img src={"/"+task_item.user_avatar} width="50" height="50" className="circle responsive-img" />
					:
					<img src="https://placeholdit.imgix.net/~text?txtsize=20&txt=%3F&w=50&h=50&txttrack=0" className="circle responsive-img" />
				}
				</div>

				<div className="task-title">{task_item.title}</div>
				<div className="clear"></div>
				{task_item.total_comment >0 ?
					<div className="task-comment-mini"><i className="material-icons tiny">comment</i> {task_item.total_comment}</div>
					:null}
					{task_item.total_task != "0/0"?
					<div className="task-todo-mini"><i className="material-icons tiny">toc</i> {task_item.total_task}</div>
					:null}
					{task_item.duedate?
						<div className="task-duedate-mini"><i className="material-icons tiny">web</i> {timeConverter(task_item.duedate)}</div>
						:null}
						{task_item.tags_name?
							<div className="task-label-mini">
							<span className="red">Tag 01</span>
							<span className="green">Tag 02</span>
							<span className="yellow">Tag 03</span>
							<span className="blue">Tag 04</span>
							<span className="orange">Tag 05</span>
							</div>
							:null}
							</Link>
							</div>
							)}

			{this.state.openAddTask ?
				<div className="task-box">
				<form onSubmit={this.submitAddTask.bind(this)}>
				<input type="text" ref="addTaskTitle" onKeyDown={this.esc.bind(this)} maxLength="100" required />
				</form>
				</div>
				:
				<div id="add-task" onClick={this.openAddTaskDialog.bind(this)}>+</div>
			}

			</div>
			)
	}

}

export default Task;