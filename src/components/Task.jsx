import React, { Component } from 'react';
import auth from './Module/Auth';
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Miss from 'react-router/Miss'
import Link from 'react-router/Link'
import Redirect from 'react-router/Redirect'
import tasks from './Module/Task';
import moment from 'moment';
import Loading from './Loading';
var _ = require('lodash')

class Task extends Component {
	static propTypes = {
		submitSuccess: React.PropTypes.bool
	}
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:"",
			projectId:this.props.projectId || this.props.params.projectId,
			cardId:this.props.cardId,
			openAddTask:false,
			listTasks:[],
			looped:false,
			totalCard:0,
			currentLoop:-1,
			showAddButton:true,
			loading:true
		}
	}
	componentDidMount(){
		tasks.list(this.props.socket,this.state.cardId,this.state.projectId,(rs)=>{
			if(!rs){

			}else{
				this.setState({listTasks:rs,loading:false });
				$( ".sort-task" ).sortable({connectWith: ".sort-task",placeholder: "ui-state-highlight",receive: this.handleSortTaskUpdate.bind(this,"receive"),stop: this.handleSortTaskUpdate.bind(this,"sort")}).disableSelection();
			}
		})
		
		this.props.socket.on('task:updateAddTaskList', this._updateAddTaskList.bind(this));
		this.props.socket.on('task:reUpdateList', this._updateList.bind(this));
		this.setState({totalCard:document.getElementsByClassName("sort-task").length})
	}
	componentDidUpdate(prevProps, prevState){
		calTeatarea()
		if(this.state.totalCard === this.state.currentLoop){
			this.setState({currentLoop: -1})
		}
		if(this.state.openAddTask){
			this.refs.addTaskTitle.focus()
		}
	}
	componentWillReceiveProps(nextProps){
		this.setState({cardId:nextProps.cardId})
		$( ".sort-task" ).sortable({connectWith: ".sort-task",placeholder: "ui-state-highlight",receive: this.handleSortTaskUpdate.bind(this,"receive"),stop: this.handleSortTaskUpdate.bind(this,"sort")}).disableSelection();
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
	}
	esc(e){
		if(e.key=="Escape"){
			this.setState({
				openAddTask: false,
				showAddButton:true
			})
		}
	}
	openAddTaskDialog(){
		this.setState({openAddTask:true,showAddButton:false});
	}
	handleSortTaskUpdate(type,event, ui){
		if(type=="receive"){
			this.setState({looped:true,loading:true})
			let id = ui['item'].attr('data-id')
			let cid = $(event['target']).attr('data-cid')
			let arr = $(event['target']).sortable('toArray', { attribute: 'data-id' })
			let parent = arr.indexOf(id)
			let after = parent
			if(parent > 0){
				parent = arr[parent - 1]
			}else{
				parent = ""
			}
			if(after >= 0){
				after = arr[after + 1]
			}else{
				after = ""
			}
			console.log('CID '+cid,'ID '+id,'P '+parent,'A '+after)
			let store_state = this.state.cardList
			tasks.sortTask(this.props.socket,cid,id,parent,after,"sorted",(rs)=>{
				if(!rs){
					$(event['target']).sortable('cancel');
					this.setState({ listTasks: store_state });
				}else{
					this.setState({looped:false})
				}
				this.setState({loading:false });
			})

		}else if(type=="sort" && !this.state.looped){
			this.setState({loading:true });
			let id = ui['item'].attr('data-id')
			let cid = $(event['target']).attr('data-cid')
			let arr = $(event['target']).sortable('toArray', { attribute: 'data-id' })
			let parent = arr.indexOf(id)
			let after = parent
			if(parent > 0){
				parent = arr[parent - 1]
			}else{
				parent = ""
			}
			if(after >= 0){
				after = arr[after + 1]
			}else{
				after = ""
			}
			
			let store_state = this.state.cardList
			tasks.sortTask(this.props.socket,cid,id,parent,after,"sorted",(rs)=>{
				if(!rs){
					$(event['target']).sortable('cancel');
					this.setState({ listTasks: store_state });
				}else{
					this.setState({looped:false})
				}
				this.setState({loading:false });
			})
		}
	}
	submitAddTask(event){
		event.preventDefault()
		this.setState({loading:true });
		const title = this.refs.addTaskTitle.value
		let parent = ""
		let cid = this.state.cardId
		parent = $('#c-'+cid+' .task-box:last-child').attr('data-id');
		if(parent === undefined || parent === null){
			parent = ""
		}
		const totalTask = this.state.listTasks.length
		tasks.add(this.props.socket,localStorage.uid,this.state.projectId,this.state.cardId,title,parent,totalTask,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				this.setState({listTasks:[]})
				this.setState({listTasks:rs,openAddTask: false,showAddButton:true});
			}
			this.setState({loading:false });
		})
	}
	styleforInputAddNew(){
		if(!this.state.showAddButton){
			return "sort-task"
		}else{
			return "sort-task min-height"
		}
	}
	render() {
		return (
			<div>
			<div className={this.styleforInputAddNew()} data-cid={this.state.cardId}>
			
			{ this.state.listTasks.map((task_item, i) =>
				<div className={"task-box " + task_item.status} data-id={task_item.id} id={"task-"+task_item.id} key={i}>
				<Link to={`/task/${task_item.id}`}>
				<div className="task-assign">
				{task_item.user_name && task_item.user_avatar ?
					<img src={"/uploads/"+task_item.user_avatar} width="50" height="50" className="avatar circle responsive-img" />
					:
					<img src="https://placeholdit.imgix.net/~text?txtsize=20&txt=%3F&w=50&h=50&txttrack=0" className="circle responsive-img" />
				}
				</div>

				<div className="task-title">{task_item.title}</div>
				<div className="clear"></div>
				{task_item.total_comment >0&&<div className="task-comment-mini"><i className="material-icons tiny">comment</i> {task_item.total_comment}</div>}
				{task_item.total_task != "0/0"&&<div className="task-todo-mini"><i className="material-icons tiny">toc</i> {task_item.total_task}</div>}
				{task_item.duedate&&<div className="task-duedate-mini"><i className="material-icons tiny">web</i> {timeConverter(task_item.duedate)}</div>}
				{task_item.tags&&
					<div className="task-label-mini">
					{task_item.tags.map((tag, tg) =>
						<div key={"tag-show-"+tg} className={"tagColor "+tag.properties.color} style={{backgroundColor:tag.properties.bg_color,color:tag.properties.f_color}}>{tag.properties.text}</div>
						)}
					<div className="clear"></div>
					</div>
				}
				</Link>
				</div>
				)}
			</div>
			{this.state.openAddTask ?
				<div className="task-box" id="taskBoxAdd">
				<form onSubmit={this.submitAddTask.bind(this)}>
				<input type="text" ref="addTaskTitle" placeholder="Enter task name or ESC to cancel" onKeyDown={this.esc.bind(this)} maxLength="100" required />
				</form>
				</div>
				:
				null
			}
			{this.state.loading?<Loading loading={this.state.loading}/>:null}
			{this.state.showAddButton&&<div id="add-task" onClick={this.openAddTaskDialog.bind(this)}>+</div>}
			</div>
			)
	}

}
Task.contextTypes = {
	router: React.PropTypes.object.isRequired
}
export default Task;