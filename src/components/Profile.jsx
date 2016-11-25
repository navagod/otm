import React, { Component } from 'react';
import auth from './Module/Auth';
class Profile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:"",
			U_email:"",
			U_name:""
		}
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	componentDidMount(){
		auth.getProfile(this.props.socket,localStorage.uid,(ds)=>{
			if(!ds){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				return this.setState({error: false,U_email:ds.email, U_name :ds.name});
			}
		})
	}
	handleSubmit(event) {
		event.preventDefault()
		const uid = localStorage.uid
		const pass = this.refs.pass.value
		const name = this.refs.name.value
		let avatar =  this.refs.avatar
		console.log(avatar.files)
		// convertFunction(avatar, function(base64Img) {
		// 	console.log(base64Img)
		// });

		// if (avatar.files && avatar.files[0]) {
		// 	var FR= new FileReader();
		// 	FR.onload = function(e) {
		// 		document.getElementById("img").src       = e.target.result;
		// 		document.getElementById("b64").innerHTML = e.target.result;
		// 	};       
		// 	FR.readAsDataURL( this.files[0] );
		// }
		// auth.saveProfile(this.props.socket,uid, pass, name, (saved) => {
		// 	if (!saved){
		// 		return Materialize.toast("เกิดข้อผิดพลาด", 4000)
		// 	}else{
		// 		return Materialize.toast("บันทึกข้อมูลสำเร็จ", 4000)
		// 	}
		// })
	}
	onChangeName(e){
		this.setState({U_name:e.target.value});
	}
	render() {
		return (

			<div className="row">
			<div className="col s6 offset-s3">
			<form className="col s12" onSubmit={this.handleSubmit}>
			<div className="text-center"><h3>PROFILE</h3></div>
			<div className="row">
			<div className="input-field col s12">
			<div id="dropdown-upload">
			<span>Choose File</span> <br/>or Drag and Drop <br/>or Ctl+V,&#8984;+V
			<input type="file" ref="avatar"  accept="image/*"/>
			</div>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<input id="email" ref="email" type="email" placeholder="Email" value={this.state.U_email} readOnly />
			<label htmlFor="email" className="active">Email</label>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<input id="name" ref="name" type="text" placeholder="Name" value={this.state.U_name} onChange={this.onChangeName.bind(this)} className="validate" required />
			<label htmlFor="name" className="active">Name</label>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<input id="password" ref="pass" type="password" className="validate" required />
			<label htmlFor="password">New Password</label>
			</div>
			</div>

			<div className="row">
			<div className="input-field col s12">
			<button type="submit" className="waves-effect waves-light btn">Save Setting</button>
			</div>
			</div>
			</form>
			</div>
			</div>

			);
	}
}

export default Profile;