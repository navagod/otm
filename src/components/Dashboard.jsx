import React, { Component } from 'react'
import {Link} from 'react-router'
import projects from './Module/Project'
import Tags from './Tags'
var _ = require('lodash')
class Dashboard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			errorMsg:"",
			dialogAdd:false,
			dialogEdit:false,
			editId:"",
			edittTitle:"",
			editDetail:"",
			editUsers:[],
			selectUser:false,
			listProject:[],
			listUsers:[],
			showTag:false
		}
	}
	componentDidMount(){
		projects.list(this.props.socket,(rs)=>{
			if(!rs){
				return Materialize.toast("ยังไม่มีโปรเจคใดๆเปิดใช้งาน", 4000)
			}else{
				return this.setState({listProject:rs})
			}
		})

		this.props.socket.on('project:updateAddList', this._updateAddProjectList.bind(this))
		this.props.socket.on('project:updateEditProject', this._updateEditProject.bind(this))
		this.props.socket.on('project:updateAddAssign', this._updateAddAssign.bind(this))
		this.props.socket.on('project:updateRemoveAssign', this._updateRemoveAssign.bind(this))
	}
	componentDidUpdate(){
		$('.tooltip-user').tooltip()
	}
	openAddProject(e){
		if(!this.state.dialogAdd){
			this.setState({dialogAdd:true})
		}
	}
	closeAddProject(e){
		if(this.state.dialogAdd){
			this.setState({dialogAdd:false})
		}
	}
	submitAddProject(event){
		event.preventDefault()
		const title = this.refs.project_add_name.value
		const detail = this.refs.detail_add_project.value
		projects.add(this.props.socket,title, detail, (rs) => {
			if(!rs){
				Materialize.toast('เกิดข้อผิดพลาด', 4000)
			}else{
				console.log(rs)
				var {listProject} = this.state
				listProject = rs.list
				this.setState({listProject,dialogAdd:false})
				Materialize.toast('เพิ่มโปรเจคใหม่สำเร็จ', 4000)
			}
		})
	}

	_updateAddProjectList(data){
		var {listProject} = this.state
		listProject = data.list
		this.setState({listProject})
	}

	_updateEditProject(data){
		var {listProject} = this.state
		listProject = data.list
		this.setState({listProject,editTitle:"",editDetail:"",editId:"",editUsers:[],dialogEdit:false})
	}

	_updateAddAssign(data){
		if(data.pid==this.state.editId){
			var {editUsers} = this.state
			editUsers.push({
				uid:data.id,
				name:data.name,
				avatar:data.avatar,
				avatar:data.color
			})
			this.setState({editUsers})
		}
	}
	_updateRemoveAssign(data){
		if(data.pid==this.state.editId){
			var {editUsers} = this.state
			var index = _.findIndex(editUsers,{uid:data.id})
			editUsers.splice(index, 1)
			this.setState({editUsers})
		}
	}
	openEditProject(id){
		if(!this.state.dialogEdit){

			projects.get(this.props.socket,id,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาดไม่พบโปรเจคนี้", 4000)
				}else{
					var users = []
					rs.map((u,i)=>
						users.push({
							uid:u['ID(u)'],
							name:u['u.Name'],
							avatar:u['u.Avatar'],
							color:u['u.Color']
						})
						)
					return this.setState({
						dialogEdit:true,
						editTitle:rs[0].p.properties.title,
						editDetail:rs[0].p.properties.detail,
						editId:id,
						editUsers:users
					})
				}
			})

		}
	}
	closeEditProject(e){
		if(this.state.dialogEdit){
			this.setState({dialogEdit:false})
		}
	}

	deleteProject(){
		event.preventDefault()
		var id = this.state.editId

		projects.delete(this.props.socket,id, (rs) => {
			if(!rs){
				Materialize.toast('เกิดข้อผิดพลาด', 4000)
			}else{
				var {listProject} = this.state
				listProject = rs
				this.setState({listProject,editTitle:"",editDetail:"",editId:"",editUsers:[],dialogEdit:false})
				Materialize.toast('ลบโปรเจคสำเร็จ', 4000)
			}
		})
	}

	openSelectUser(){
		if(!this.state.selectUser){
			projects.getUsers(this.props.socket,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาดไม่พบสมาชิกคนอื่น", 4000)
				}else{
					return this.setState({selectUser:true,listUsers:rs})
				}
			})

		}
	}
	closeSelectUser(e){
		if(this.state.selectUser){
			this.setState({selectUser:false})
		}
	}

	submitEditProject(event){
		event.preventDefault()
		var id = this.state.editId
		const title = this.refs.project_edit_name.value
		const detail = this.refs.detail_edit_project.value
		projects.save(this.props.socket,title, detail, id, (rs) => {
			if(!rs){
				Materialize.toast('เกิดข้อผิดพลาด', 4000)
			}else{
				var {listProject} = this.state
				listProject = rs
				this.setState({listProject,editTitle:"",editDetail:"",editId:"",editUsers:[],dialogEdit:false})
				Materialize.toast('บันทึกโปรเจคสำเร็จ', 4000)
			}
		})
	}

	onEditTitle(e){
		this.setState({editTitle:e.target.value})
	}
	onEditDetail(e){
		this.setState({editDetail:e.target.value})
	}

	activeListUser(id){
		if(_.findIndex(this.state.editUsers,{'uid':id}) >=0){
			return "chooseUser active"
		}else{
			return "chooseUser"
		}
	}
	selectUserActive(uid){
		var mode = ""
		if(_.findIndex(this.state.editUsers,{'uid':uid}) >=0){
			mode = "delete"
		}else{
			mode = "add"
		}
		projects.assignedUser(this.props.socket,uid,this.state.editId,mode,(rs)=>{
			if(!rs){
				Materialize.toast('เกิดข้อผิดพลาด', 4000)
			}else{
				var {editUsers} = this.state
				if(mode=="add"){
					editUsers.push({
						uid:rs.id,
						name:rs.name,
						avatar:rs.avatar,
						color:rs.color
					})
					this.setState({editUsers})

				}else{
					var index = _.findIndex(editUsers,{uid:uid})
					editUsers.splice(index, 1)
					this.setState({editUsers})
				}
			}
		})
	}
	openTags(){
		this.setState({showTag:true,dialogEdit:false})
	}
	closeTags(){
		this.setState({showTag:false,dialogEdit:false})
	}
	render() {
		var items = this.state.listProject

		var arrs = groupBy(items, function(item) {
			return [item.id]
		})

		return (
			<div className="row">
			<div className="head-bar">
			<button className="waves-effect waves-light btn modalTriger" onClick={this.openAddProject.bind(this)}>Add Project</button>
			</div>
			<div id="list-board">
			<div className="row">
			{ arrs.map((item, i) =>
				<div className="col s4 m3" key={i}>
				<div className="card blue-grey">
				<div className="editProjectBtn waves-effect waves-blue blue btn-flat" onClick={this.openEditProject.bind(this,item[0].id)}><i className="material-icons">mode_edit</i></div>
				<Link to={`/project/${item[0].id}`}>
				<div className="card-content white-text">
				<span className="card-title">{item[0].title}</span>
				<div></div>
				<p>{item[0].detail}</p>
				</div>
				</Link>
				<div className="card-action">


				{item.map((u, ui) =>
					<div className="col s2 no-padding" key={"project_dashboard-"+ui}>
					{u.user_name
						? <div>
						{u.user_avatar
							? <img  src={"/uploads/"+u.user_avatar} className="avatar circle responsive-img tooltipped tooltip-user" data-position="top" data-delay="50" data-tooltip={u.user_name} />
							: <img src={"https://placeholdit.imgix.net/~text?txtsize=20&txt="+u.user_name.charAt(0).toUpperCase()+"&w=50&h=50&txttrack=0&txtclr=000000&bg=" + u.user_color} className="avatar circle tooltipped tooltip-user" data-position="top" data-delay="50" data-tooltip={u.user_name} />
						}
						</div>
						:null}
						</div>
						)}
				</div>

				</div>

				</div>
				)
		}
		</div>
		</div>

		{this.state.dialogAdd&&
			<div>
			<div id="addProject" className="modal modal-fixed-footer open">
			<form onSubmit={this.submitAddProject.bind(this)}>
			<div className="modal-content">
			<h4>Add Project</h4>
			<div>

			<div className="row">
			<div className="input-field col s12">
			<input id="project_add_name" ref="project_add_name" type="text" className="validate"  required />
			<label htmlFor="project_add_name" className="active">Project Name</label>
			</div>
			</div>
			<div className="row">
			<div className="input-field col s12">
			<textarea id="detail_add_project" ref="detail_add_project" className="materialize-textarea" ></textarea>
			<label htmlFor="detail_add_project" className="active">Project Detail</label>
			</div>
			</div>
			</div>
			</div>
			<div className="modal-footer">
			<button type="submit" className="waves-effect waves-green btn-flat">Create</button>
			<button type="button" className="waves-effect waves-red btn-flat" id="closeAddProject" onClick={this.closeAddProject.bind(this)}>Close</button>
			</div>
			</form>
			</div>
			<div className="lean-overlay" id="materialize-lean-overlay-1"></div>
			</div>
		}

		{this.state.dialogEdit&&
			<div>
			<div id="editProject" className="modal modal-fixed-footer open">
			<form onSubmit={this.submitEditProject.bind(this)}>
			<div className="modal-content">
			<h5 className="left">Edit Project</h5>
			<div className="manage-tags-btn right" onClick={this.openTags.bind(this)}>Manage Tags</div>
			<div>

			<div className="row">
			<div className="input-field col s12">
			<input id="project_edit_name" ref="project_edit_name" type="text" className="validate" value={this.state.editTitle} onChange={this.onEditTitle.bind(this)} placeholder="Name" required />
			<label htmlFor="project_edit_name" className="active">Project Name</label>
			</div>
			</div>
			<div className="row">
			<div className="input-field col s12">
			<textarea id="detail_edit_project" ref="detail_edit_project" className="materialize-textarea" value={this.state.editDetail} onChange={this.onEditDetail.bind(this)} placeholder="Detail"></textarea>
			<label htmlFor="detail_edit_project" className="active">Project Detail</label>
			</div>
			</div>
			<div className="row">
			<div className="">
			{this.state.editUsers.map((u, ui) =>
				<div className="col s1 no-padding" key={ui}>
				{u.name&&
					<div>
					{u.avatar?
						<img  src={"/uploads/"+u.avatar} className="avatar circle responsive-img tooltipped tooltip-user" data-position="top" data-delay="50" data-tooltip={u.name} />
						:
						<img src={"https://placeholdit.imgix.net/~text?txtsize=20&txt="+u.name.charAt(0).toUpperCase()+"&w=50&h=50&txttrack=0&txtclr=000000&bg=" + u.color} className="circle responsive-img tooltipped tooltip-user" data-position="top" data-delay="50" data-tooltip={u.name} />
					}
					</div>
				}
				</div>
				)}
			</div>
			<button type="button" className="box-assign-user waves-effect waves-blue btn" id="assign-btn" onClick={this.openSelectUser.bind(this)}>+</button>
			</div>
			</div>
			</div>
			<div className="modal-footer">
			<button type="submit" className="waves-effect waves-green btn-flat green">Save</button>
			<button type="button" className="waves-effect waves-red btn-flat" id="closeAddProject" onClick={this.closeEditProject.bind(this)}>Close</button>
			<button type="button" className="waves-effect waves-red btn-flat red"  onClick={this.deleteProject.bind(this)}>Delete Project</button>
			</div>
			</form>
			</div>
			<div className="lean-overlay" id="materialize-lean-overlay-2"></div>
			</div>
		}
		{this.state.showTag&&<Tags projectId={this.state.editId} socket={this.props.socket} closeTags={this.closeTags.bind(this)} />}
		{this.state.selectUser&&
			<div id="user-list" className="modal modal-fixed-footer open">
			<div className="modal-content">
			<h4>Select Uses</h4>
			<div>
			<div className="row">
			{ this.state.listUsers.map((user, i) =>

				<div key={i} className={this.activeListUser(user.id)} onClick={this.selectUserActive.bind(this,user.id)}>
				{user.avatar?
					<img src={"/uploads/"+user.avatar} className="avatar circle responsive-img" data-position="top" data-delay="50" data-tooltip={user.name} />
					:
					<img src={"https://placeholdit.imgix.net/~text?txtsize=20&txt="+user.name.charAt(0).toUpperCase()+"&w=50&h=50&txttrack=0&txtclr=000000&bg="+ user.color} className="circle responsive-img" data-position="top" data-delay="50" data-tooltip={user.name} />
				}
				</div>
				)}
			</div>
			</div>
			</div>
			<div className="modal-footer">
			<button type="button" className="waves-effect waves-green green btn-flat" onClick={this.closeSelectUser.bind(this)}>OK</button>
			</div>
			</div>
			}
			</div>
			)
}
}


export default Dashboard
