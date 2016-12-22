import React, { Component } from 'react';
import Redirect from 'react-router/Redirect'
import InlineEdit from 'react-edit-inline';
import projects from './Module/Project'
import { ChromePicker } from 'react-color';
class Tags extends Component {
	state = {
		tempTagId:null,
		tempColor:null,
	};
	constructor(props) {
		super(props);
		this.state = {
			tagList:[],
			projectId:this.props.projectId,
			customBgColorPickerDisplay:[],
			customFColorPickerDisplay:[],
			customBgColor:[],
			customFColor:[],
		}
	}
	componentDidMount() {
		projects.listTag(this.props.socket,this.state.projectId,(rs)=>{
			if(!rs){

			}else{
				var bg_pick_display = [];
				var f_pick_display = [];
				var c_bg_color = [];
				var c_f_color = [];
				for (var i in rs) {
					bg_pick_display[rs[i]["ID(t)"]] = "none";
					f_pick_display[rs[i]["ID(t)"]] = "none";
					if (rs[i]["t.bg_color"] != null) {
						c_bg_color[rs[i]["ID(t)"]] = rs[i]["t.bg_color"];
					} else {
						c_bg_color[rs[i]["ID(t)"]] = "rgba(255,255,255,1)";
					}
					if (rs[i]["t.f_color"] != null) {
						c_f_color[rs[i]["ID(t)"]] = rs[i]["t.f_color"];
					} else {
						c_f_color[rs[i]["ID(t)"]] = "rgba(255,255,255,1)";
					}
				}
				this.setState({customBgColorPickerDisplay:bg_pick_display,
					customFColorPickerDisplay:f_pick_display,
					customBgColor:c_bg_color,
					customFColor:c_f_color,
					tagList:rs});
			}
		})
	}
	submitAddTags(event){
		event.preventDefault()

		var text = this.refs.tagAddTitile.value
		if(text!=""){
			projects.addTag(this.props.socket,this.state.projectId,text,'black_tag',(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด", 4000)
				}else{
					var {tagList} = this.state
					tagList.push({
						'ID(t)':rs[0]['ID(t)'],
						't.text':text,
						't.color':'black_tag',
						't.bg_color':"",
						't.f_color':""
					});
					this.state.customBgColor[rs[0]['ID(t)']] = "";
					this.state.customFColor[rs[0]['ID(t)']] = "";
					this.state.customBgColorPickerDisplay[rs[0]['ID(t)']] = "none";
					this.state.customFColorPickerDisplay[rs[0]['ID(t)']] = "none";
					this.setState({tagList})
					this.refs.tagAddTitile.value = ""
				}
			})
		}else{
			return Materialize.toast("กรุณาใส่ข้อความ", 4000)
		}
	}
	tagChange(id,data){
		projects.editTag(this.props.socket,id,data.text,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{"ID(t)":id})
				tagList[index]["t.text"] = data.text
				this.setState({tagList})
			}
		})
	}
	deleteItem(id){
		projects.deleteTag(this.props.socket,id,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{'ID(t)':id})
				tagList.splice(index, 1);
				this.setState({tagList})
			}
		})
	}
	classColor(color,item){
		if(color == item){
			return "coloTag active " + color;
		}else{
			return "coloTag "+color;
		}
	}
	setColor(color,tid){
		projects.colorTag(this.props.socket,color,tid,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{'ID(t)':tid})
				tagList[index]['t.color'] = color;
				this.setState({tagList})
			}
		})
	}
	showBGPickUpColor(tid) {
/*		for (var i in this.state.customFColorPickerDisplay) {
			if (this.state.customFColorPickerDisplay[i] != "none") {
				this.state.tempTagId = null;
				this.state.customFColorPickerDisplay[i] = "none";
			}
		}*/
		if (this.state.tempTagId == null) {/*
			for (var i in this.state.customBgColorPickerDisplay) {
				this.state.customBgColorPickerDisplay[i] = "none";
			}*/
			this.state.tempTagId = tid;
			this.state.tempColor = this.state.customBgColor[tid];
			this.state.customBgColorPickerDisplay[tid] = "block";
		}/* else {
			this.state.customBgColorPickerDisplay[tid] = "none";
			this.state.tempTagId = null;
			this.setCustomBackground(tid);
		}*/
	}
	showFPickUpColor(tid) {
/*		for (var i in this.state.customBgColorPickerDisplay) {
			if (this.state.customBgColorPickerDisplay[i] != "none") {
				this.state.tempTagId = null;
				this.state.customBgColorPickerDisplay[i] = "none";
			}
		}*/
		if (this.state.tempTagId == null) {/*
			for (var i in this.state.customFColorPickerDisplay) {
				this.state.customFColorPickerDisplay[i] = "none";
			}*/
			this.state.tempTagId = tid;
			this.state.tempColor = this.state.customFColor[tid];
			this.state.customFColorPickerDisplay[tid] = "block";
		}/* else {
			this.state.customFColorPickerDisplay[tid] = "none";
			this.state.tempTagId = null;
			this.setCustomFont(tid);
		}*/
	}
	setCustomBackground(tid) {
		this.state.customBgColorPickerDisplay[tid] = "none";
		this.state.tempTagId = null;
		var color = this.state.customBgColor[tid];
		projects.colorTagCustomBG(this.props.socket,color,tid,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{'ID(t)':tid})
				tagList[index]['t.bg_color'] = color;
				this.setState({tagList})
			}
		});
	}
	closeAndReturnCustomBackground(tid) {
		this.state.customBgColor[tid] = this.state.tempColor;
		this.state.customBgColorPickerDisplay[tid] = "none";
		this.state.tempTagId = null;
	}
	setCustomFont(tid) {
		this.state.customFColorPickerDisplay[tid] = "none";
		this.state.tempTagId = null;
		var color = this.state.customFColor[tid];
		projects.colorTagCustomF(this.props.socket,color,tid,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{'ID(t)':tid})
				tagList[index]['t.f_color'] = color;
				this.setState({tagList})
			}
		});
	}
	closeAndReturnCustomFont(tid) {
		this.state.customFColor[tid] = this.state.tempColor;
		this.state.customFColorPickerDisplay[tid] = "none";
		this.state.tempTagId = null;
	}
	clearCustomBackground(tid) {
		var color = "";
		this.state.customBgColor[tid] = "";
		projects.colorTagCustomBG(this.props.socket,color,tid,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{'ID(t)':tid})
				tagList[index]['t.bg_color'] = color;
				this.setState({tagList})
			}
		})
	}
	clearCustomFont(tid) {
		var color = "";
		this.state.customFColor[tid] = "";
		projects.colorTagCustomF(this.props.socket,color,tid,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {tagList} = this.state;
				var index = _.findIndex(tagList,{'ID(t)':tid})
				tagList[index]['t.f_color'] = color;
				this.setState({tagList})
			}
		})
	}
	handleChangeBg = (color) => {
		this.state.customBgColor[this.state.tempTagId] = "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")";
	};
	handleChangeF = (color) => {
		this.state.customFColor[this.state.tempTagId] = "rgba("+color.rgb.r+","+color.rgb.g+","+color.rgb.b+","+color.rgb.a+")";
	};
	render() {
		var colors = ["purple_tag","pink_tag","red_tag","orange_tag","yellow_tag","green_tag","blue_tag","black_tag"]
		return (<div id="manage-tag-popup">
			<div id="editTags" className="modal modal-fixed-footer open">

				<div className="modal-content">
					<h5>Tags Manage</h5>
					<div>
						<div className="row">
							<form onSubmit={this.submitAddTags.bind(this)}>
								<input type="text" ref="tagAddTitile"  className="todoInputAdd" placeholder="Add new tag name" required/>
							</form>
							{this.state.tagList.map((item,i)=>
								<div key={"todo-"+i+item["ID(t)"]} data-id={item["ID(t)"]} className="tagItem">
									<div className="col s2">
										<div className={"tagColorExample "+item["t.color"]} style={{backgroundColor:this.state.customBgColor[item["ID(t)"]],color:this.state.customFColor[item["ID(t)"]]}}>Example</div>
									</div>
									<div className="col s6" id='label_name'>
										<InlineEdit
											activeClassName="editing"
											text={item["t.text"]}
											paramName="text"
											change={this.tagChange.bind(this,item["ID(t)"])}
										/>
									</div>
									<div className="col s3">
										{
											colors.map((color,c)=>
												<div className={this.classColor(color,item["t.color"])} onClick={this.setColor.bind(this,color,item["ID(t)"])} key={"color-"+i+"-"+c}></div>
											)
										}

									</div>
									<div className="col s1">
										<div className="deleteItem" onClick={this.deleteItem.bind(this,item["ID(t)"])}>X</div>
									</div>
									<div id='tag_color_panel'>
										<div className='inline_div'>
											<div className='inline_div'>Tag color</div>
											<div className='preview_bg inline_div'>
												<div className='color_preview inline_div' style={{backgroundColor:this.state.customBgColor[item["ID(t)"]]}} onClick={this.showBGPickUpColor.bind(this,item["ID(t)"])}></div>
												<div className='pickup_panel' style={{display:this.state.customBgColorPickerDisplay[item["ID(t)"]]}}>
													<ChromePicker color={this.state.customBgColor[item["ID(t)"]]} onChange={ this.handleChangeBg } />
													<div className='button'>
														<i className="material-icons" onClick={this.closeAndReturnCustomBackground.bind(this,item["ID(t)"])}>clear</i>
													</div>
													<div className='button'>
														<i className="material-icons" onClick={this.setCustomBackground.bind(this,item["ID(t)"])}>format_color_fill</i>
													</div>
												</div>
											</div>
											<i className="material-icons" onClick={this.clearCustomBackground.bind(this,item["ID(t)"])}>format_color_reset</i>
										</div>
										<div className='inline_div'>
											<div className='inline_div'>Font color</div>
											<div className='preview_f inline_div'>
												<div className='color_preview inline_div' style={{backgroundColor:this.state.customFColor[item["ID(t)"]]}} onClick={this.showFPickUpColor.bind(this,item["ID(t)"])}></div>
												<div className='pickup_panel' style={{display:this.state.customFColorPickerDisplay[item["ID(t)"]]}}>
													<ChromePicker color={this.state.customFColor[item["ID(t)"]]} onChange={ this.handleChangeF } />
													<div className='button'>
														<i className="material-icons" onClick={this.closeAndReturnCustomFont.bind(this,item["ID(t)"])}>clear</i>
													</div>
													<div className='button'>
														<i className="material-icons" onClick={this.setCustomFont.bind(this,item["ID(t)"])}>format_color_text</i>
													</div>
												</div>
											</div>
											<i className="material-icons" onClick={this.clearCustomFont.bind(this,item["ID(t)"])}>format_color_reset</i>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
				<div className="modal-footer">
					<button type="button" className="waves-effect waves-green green btn-flat" id="closeAddProject" onClick={this.props.closeTags}>OK</button>
				</div>
			</div>
			<div className="lean-overlay" id="materialize-lean-overlay-2"></div>
		</div>)
	}
}
Tags.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default Tags;
