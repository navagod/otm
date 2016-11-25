import React, { Component } from 'react'
import {Link} from 'react-router'
import Tasks from './Module/Task'
import InlineEdit from 'react-edit-inline';
class Todo extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			taskId:this.props.tid,
			todoList:[]
		}
	}
	componentDidMount(){
		this.refs.todoInputAdd.focus()
		Tasks.listTodo(this.props.socket,this.state.taskId,(rs)=>{
			if(!rs){

			}else{
				this.setState({todoList:rs})
			}
		})
	}
	componentWillMount() {
		
	}
	submitAdd(event){
		event.preventDefault()

		var text = this.refs.todoInputAdd.value
		if(text!=""){
			var position = (this.state.todoList.length + 1)
			Tasks.addTodo(this.props.socket,this.state.taskId,text,position,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด", 4000)
				}else{
					var {todoList} = this.state
					todoList.push({
						'ID(td)':rs[0]['ID(td)'],
						'td.text':text,
						'td.position':position
					})
					this.setState({todoList})
					this.refs.todoInputAdd.value = ""
				}
			})
		}else{
			return Materialize.toast("กรุณาใส่ข้อความ", 4000)
		}
	}
	checkerItem(id,status){
		var new_status = ''
		if(status=='success'){
			new_status = ''
		}else{
			new_status = 'success'
		}
		Tasks.statusTodo(this.props.socket,id,new_status,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {todoList} = this.state;
				var index = _.findIndex(todoList,{'ID(td)':id})
				todoList[index]['td.status'] = new_status
				this.setState({todoList})
			}
		})
	}
	deleteIted(id){
		Tasks.deleteTodo(this.props.socket,id,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {todoList} = this.state;
				var index = _.findIndex(todoList,{'ID(td)':id})
				todoList.splice(index, 1);
				this.setState({todoList})
			}
		})
	}
	todoChanged(id,data){
		Tasks.editTodo(this.props.socket,id,data.text,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {todoList} = this.state;
				var index = _.findIndex(todoList,{"ID(td)":id})
				todoList[index]["td.text"] = data.text
				this.setState({todoList})
			}
		})
	}
	render() {
		return (
			<div>
			{this.state.todoList.map((item,i)=>
				<div key={"todo-"+i+item["ID(td)"]} data-id={item["ID(td)"]} className={"todoItem "+item["td.status"]}>
				<div className="checkItem" onClick={this.checkerItem.bind(this,item["ID(td)"],item["td.status"])}></div>
				<InlineEdit
				activeClassName="editing"
				text={item["td.text"]}
				paramName="text"
				change={this.todoChanged.bind(this,item["ID(td)"])}
				/>
				<div className="deleteItem" onClick={this.deleteIted.bind(this,item["ID(td)"])}>X</div>
				</div>
				)}
			<form onSubmit={this.submitAdd.bind(this)}>
			<input type="text" ref="todoInputAdd"  className="todoInputAdd" placeholder="Enter something todo and press Enter" required/>
			</form>
			</div>
			)
	}
}
export default Todo;