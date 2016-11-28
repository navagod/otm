import React, { Component } from 'react';
import Redirect from 'react-router/Redirect'
import InlineEdit from 'react-edit-inline';
import projects from './Module/Project'
class Tags extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tagList:[],
			projectId:this.props.projectId,
		}
	}
	componentDidMount() {
		projects.listTag(this.props.socket,this.state.projectId,(rs)=>{
			if(!rs){

			}else{
				this.setState({tagList:rs})
			}
		})
	}
	submitAddTags(event){
		event.preventDefault()

		var text = this.refs.tagAddTitile.value
		if(text!=""){
			projects.addTag(this.props.socket,this.state.projectId,text,'black',(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด", 4000)
				}else{
					var {tagList} = this.state
					tagList.push({
						'ID(t)':rs[0]['ID(t)'],
						't.text':text,
						't.color':'black'
					})
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
				tagList[index]['t.color'] = color
				this.setState({tagList})
			}
		})
	}
	render() {
		var colors = ["red","blue","pink","yellow","green","orange","black","purple"]
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
				<div className="col s1">
				<div className={"tagColorExample "+item["t.color"]}></div>
				</div>
				<div className="col s7">
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
