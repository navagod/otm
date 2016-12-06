import React, { Component } from 'react'
import {Link} from 'react-router'
import projects from './Module/Project'
import css from '../../dist/css/dashboard.css'
// require('../../dist/css/dashboard.css')

class Dashboard_na extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listPerson: [],
			listProject: [],
			dialogAdd:false,
			dialogEdit:false,
			editId:"",
			edittTitle:"",
			editDetail:"",
			editUsers:[],
		}
	}

	componentDidMount(){
		projects.getMyProject(this.props.socket,localStorage.uid,(rs)=>{
			if(!rs){
				return Materialize.toast("Empty Project", 4000)
			}else{
				return this.setState({listProject:rs})
			}
		})

		this.props.socket.on('project:updateEditProject', this._updateEditProject.bind(this))
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
							avatar:u['u.Avatar']
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

	submitEditProject(event){
		event.preventDefault()
		var id = this.state.editId
		const title = this.refs.project_edit_name.value
		const detail = this.refs.detail_edit_project.value
		projects.save(this.props.socket,title, detail, id, localStorage.uid, (rs) => {
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

	_updateEditProject(data){
		var {listProject} = this.state
		listProject = data.list
		this.setState({listProject,editTitle:"",editDetail:"",editId:"",editUsers:[],dialogEdit:false})
	}

	onEditTitle(e){
		this.setState({editTitle:e.target.value})
	}

	onEditDetail(e){
		this.setState({editDetail:e.target.value})
	}

	closeEditProject(e){
		if(this.state.dialogEdit){
			this.setState({dialogEdit:false})
		}
	}

	deleteProject(){
		event.preventDefault()
		var id = this.state.editId
		projects.delete(this.props.socket,id,localStorage.uid,(rs) => {
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

	render() {
		var person = this.state.listPerson
		var project = this.state.listProject
	    return (
	    	<div className="dashboard-panel">
	    		<div className="project-panel">
	    			{/* <div className="project-panel-toggle"></div> */}
	    			<div className="project-panel-inner">
	    				<div className="button-bar">
	    					<button className="waves-effect waves-light btn modalTriger" onClick={this.openAddProject.bind(this)}>Add Project</button>
	    				</div>
		    		{ project.map((item, i) =>
		    			<div key={i} className="project-link-box">
		    				<Link to={`/project/${item.id}`}>
		    					<div className="project-name">{item.title}</div>
		    				</Link>
		    				<div className="project-edit" onClick={this.openEditProject.bind(this,item.id)}></div>
		    			</div>
		    		)}
		    		</div>
	    		</div>
	    		<div className="title-panel">
	    			<div className="title">Hello, { localStorage.name } !!</div>
	    			<div className="subtitle">Dashboard</div>
	    		</div>
	    		<div className="clearfix"></div>


	   		{ this.state.dialogAdd&&
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
							<div className="row-panel">
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
									<label htmlFor="detail_edit_project" className="active">Member</label>
									{
										this.state.editUsers.map((item,i) =>
										<div key={i}>
											{item.name}{i}
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="submit" className="waves-effect waves-green btn-flat">Save</button>
							<button type="button" className="waves-effect waves-red btn-flat" id="closeAddProject" onClick={this.closeEditProject.bind(this)}>Close</button>
							<button type="button" className="waves-effect waves-red btn-flat"  onClick={this.deleteProject.bind(this)}>Delete Project</button>
							<div className="clearfix"></div>
						</div>
					</form>
				</div>
				</div>
			}
			</div>
	  	);
	}

}
export default Dashboard_na;