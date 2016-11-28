import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import auth from './Module/Auth';
import { Receiver } from 'react-file-uploader';
var Dropzone = require('react-dynamic-dropzone');

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
		this.onDropFile = this.onDropFile.bind(this);
	}
	componentDidMount(){
		auth.getProfile(this.props.socket,localStorage.uid,(ds)=>{
			if(!ds){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				return this.setState({error: false,U_email:ds.email, U_name :ds.name, U_avatar :ds.avatar});
			}
		})
	}
	handleSubmit(event) {
		event.preventDefault()
		const uid = localStorage.uid
		const pass = this.refs.pass.value
		const name = this.refs.name.value
		const avatar = this.refs.avatar.value
		auth.saveProfile(this.props.socket,uid, pass, name, avatar, (saved) => {
			if (!saved){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				return Materialize.toast("บันทึกข้อมูลสำเร็จ", 4000)
			}
		})
	}
	onChangeName(e){
		this.setState({U_name:e.target.value});
	}
	onDragEnter(e) {
	    this.setState({ isReceiverOpen: true });
	}
	onDragOver(e) {
	    // your codes here
	}
	onDragLeave(e) {
	    this.setState({ isReceiverOpen: false });
	}
	onDropFile(acceptedFiles, rejectedFiles) {
		const uid = localStorage.uid
		var _this = this;
		var reader = new window.FileReader();
		var first_file = acceptedFiles[0];
		 reader.readAsBinaryString(first_file);
		 var socket_send = this.props.socket;
		 reader.onload = function(event) {
	        var base64data = event.target.result;
			auth.saveAvatar(socket_send,uid, base64data, (file_name) => {
				if (file_name == ""){
					return Materialize.toast("เกิดข้อผิดพลาด", 4000)
				}else{
					_this.setState({U_avatar:file_name});
					return Materialize.toast("อัฑโหลดรูปโปรไฟล์เรียบร้อยแล้ว", 4000)
				}
			})
		}
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
				<input id="avatar" ref="avatar" type="hidden" value={this.state.U_avatar} />
				<Dropzone ref="dropzone" onDrop={this.onDropFile} socket={this.socket}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
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