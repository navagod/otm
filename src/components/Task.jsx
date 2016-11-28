import React, { Component } from 'react';
import auth from './Module/Auth';
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Miss from 'react-router/Miss'
import Link from 'react-router/Link'
import Redirect from 'react-router/Redirect'
import tasks from './Module/Task';
import moment from 'moment';
var _ = require('lodash')

class Task extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:"",
			projectId:this.props.projectId || this.props.params.projectId,
			cardId:this.props.cardId,
			openAddTask:false,
			listTasks:[]
		}
	}
	componentDidMount(){
		tasks.list(this.props.socket,this.state.cardId,(rs)=>{
			if(!rs){

			}else{
				this.setState({listTasks:rs });
				// $( ".sort-task" ).sortable({connectWith: ".sort-task",update: this.handleSortTaskUpdate.bind(this)}).disableSelection();
			}
		})
		
		this.props.socket.on('task:updateAddTaskList', this._updateAddTaskList.bind(this));
		this.props.socket.on('task:reUpdateList', this._updateList.bind(this));
	}
	componentDidUpdate(prevProps, prevState){
		calTeatarea()
	}
	componentWillReceiveProps(nextProps){
		this.setState({cardId:nextProps.cardId})
		// $( ".sort-task" ).sortable({connectWith: ".sort-task",update: this.handleSortTaskUpdate.bind(this)}).disableSelection();
		tasks.list(this.props.socket,nextProps.cardId,(rs)=>{
			if(!rs){

			}else{
				this.setState({listTasks:rs });
			}
		})
	}
	_updateAddTaskList(data){
		if(data.pid == this.state.projectId && data.lists.cid == this.state.cardId){
			var {listTasks} = this.state;
			listTasks.push(data.lists);
			this.setState({listTasks});
		}
	}
	_updateList(data){
		this.context.router.transitionTo('/project/'+this.state.projectId)
		// console.log(this.state.cardId,data)
		// if(data.cid == this.state.cardId){
		// 	this.setState({listTasks:data.lists});
		// }
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
	handleSortTaskUpdate(event, ui){
		let item_div = document.getElementsByClassName("sort-task");
		for(let i = 0; i < item_div.length; i++)
		{
			let div = item_div.item(i);
			let ids = $(div).sortable('toArray', { attribute: 'data-id' })
			let items = []
			ids.forEach(function (i, index) {
				if(i!=''){
					items.push(i)
				}
			})
			
			let store_state = this.state.cardList
			let cid = div.dataset.cid
			tasks.sortTask(this.props.socket,items,this.state.projectId,div.dataset.cid,(rs)=>{
				if(!rs){
					$(div).sortable('cancel');
					this.setState({ listTasks: store_state });
				}else{
					this.reupdateList.bind(this,cid)()
				}
			})
		}
	}
	reupdateList(cid){
		// this.context.router.transitionTo('/project/'+this.state.projectId)
		// tasks.listUpdate(this.props.socket,cid,(rs)=>{
		// 	if(!rs){
		// 		console.log('False',rs)
		// 	}else{
		// 		console.log(rs)
		// 		this.setState({ listTasks: rs });
		// 	}
		// })
	}
	submitAddTask(event){
		event.preventDefault()
		const title = this.refs.addTaskTitle.value
		const sortNum = this.state.listTasks.length + 1
		tasks.add(this.props.socket,localStorage.uid,this.state.projectId,this.state.cardId,title,sortNum,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {listTasks} = this.state;
				listTasks.push(rs.lists);
				this.setState({listTasks,openAddTask: false});
			}
			
		})
	}
	render() {
		return (
			<div className="sort-task" data-cid={this.state.cardId}>
			
			{ this.state.listTasks.map((task_item, i) =>
				<div className={"task-box " + task_item.status} data-id={task_item.id} id={"task-"+task_item.id} key={i}>
				<Link to={`/task/${task_item.id}`}>
				<div className="task-assign">
				{task_item.user_name && task_item.user_avatar ?
					<img src={"/"+task_item.user_avatar} width="50" height="50" className="circle responsive-img" />
					:
					<img src="https://placeholdit.imgix.net/~text?txtsize=20&txt=%3F&w=50&h=50&txttrack=0" className="circle responsive-img" />
				}
				</div>

				<div className="task-title">{task_item.title}</div>
				<div className="clear"></div>
				{task_item.total_comment >0&&<div className="task-comment-mini"><i className="material-icons tiny">comment</i> {task_item.total_comment}</div>}
				{task_item.total_task != "0/0"&&<div className="task-todo-mini"><i className="material-icons tiny">toc</i> {task_item.total_task}</div>}
				{task_item.duedate&&<div className="task-duedate-mini"><i className="material-icons tiny">web</i> {timeConverter(task_item.duedate)}</div>}
				{task_item.tags[0].title&&
					<div className="task-label-mini">
					{task_item.tags.map((tag, tg) =>
						<div key={"tag-show-"+tg} className={"tagColor "+tag.color}>{tag.title}</div>
						)}
					<div className="clear"></div>
					</div>
				}
				</Link>
				</div>
				)}

			{this.state.openAddTask ?
				<div className="task-box" id="taskBoxAdd">
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
Task.contextTypes = {
	router: React.PropTypes.object.isRequired
}
export default Task;