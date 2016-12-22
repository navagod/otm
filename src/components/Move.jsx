import React, { Component } from 'react'
import Dropdown from 'react-dropdown'
import Project from './Module/Project'
import MoveModule from './Module/Move'
import Tasks from './Module/Task'
import Loading from './Loading';

import '../../dist/css/move.css';

class Move extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			taskId: this.props.taskId,
			socket: this.props.socket,
			popupState: false,
			listCard: {},
			listProject: {},
			selectedProject: {},
			selectedCard: {},
			tempCard: {}
		}
		this._onSelectProject = this._onSelectProject.bind(this);
		this._onSelectCard = this._onSelectCard.bind(this);
		this.moveSubmit = this.moveSubmit.bind(this);
	}

	componentWillMount(){
		var socket = this.state.socket;
		var _this = this;
		var cart_id = "";
		Tasks.get(this.state.socket,"",this.state.taskId,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด ไม่พบ Task นี้", 4000)
			}else{
				this.setState({projectId:rs[0]["ID(p)"],cardID: rs[0]["t.cid"]})
			}
		})
		Project.list(socket,(rs)=>{
			if(!rs){
				return {};
			}else{
				var list_project = [];
				var defaultProject = [];
				var default_project_id = this.state.projectId;
				Object.keys(rs).map(function(objectKey, index) {
					var v_exist = false;
					for(var j = 0; j != list_project.length; ++j) {
				        if(list_project[j].value == rs[objectKey].id) v_exist = true;
				    }
					if(!v_exist) {
					    var arr_list = {
					    	value: rs[objectKey].id,
					    	label: rs[objectKey].title
					    };

					    if(rs[objectKey].id == default_project_id){
					    	defaultProject = arr_list;
					    	_this._onSelectProject(arr_list);
					    }

					    list_project.push(arr_list);
					}
				});
				this.setState({
					listProject: list_project,
					selectedProject: defaultProject
				})
			}
		})
	}

	_onSelectProject(project){
		var _this = this;
		var default_selected_card = [{
										value: "0",
										label: "Select card"
									}];
		Project.listCard(this.props.socket,project.value,(rsCard)=>{
			if(rsCard){
				var arr_list = [];
				var default_card = [];
				if(rsCard.lists.length > 0){
					Object.keys(rsCard.lists).map(function(objectKeyCard, indexCard) {
						var arr_list_card = {
									label: rsCard.lists[objectKeyCard].title,
									value: rsCard.lists[objectKeyCard].id
								};
						arr_list.push(arr_list_card);
						if(rsCard.lists[objectKeyCard].id == _this.state.cardID){
							default_card = arr_list_card;
							_this.setState({tempCard:rsCard.lists[objectKeyCard].id})
						}
					});
					this.setState({
						listCard: arr_list,
						selectedCard: default_card.length == 0 ? arr_list[0] : default_card
					})
				}else{
					this.setState({
						listCard: default_selected_card,
						selectedCard: default_selected_card[0]})
				}
			}else{
				this.setState({
						listCard: default_selected_card,
						selectedCard: default_selected_card[0]})
			}
		})
		this.setState({selectedProject: project})
	}

	_onSelectCard(card){
		this.setState({selectedCard: card})
	}

	popupShow(){
		if(!$("#move-panel-inner").is(":visible")){
			this.setState({popupState:true})
		}else{
			this.setState({popupState:false})
		}
	}

	moveSubmit(){
		var project_id = $("input[name='project']").val();
		var card_id = $("input[name='card']").val();
		var task_id = this.state.taskId;
		var temp_card_id = this.state.tempCard;
		if(temp_card_id != card_id){
			if($("input[name='project']").val() == "" || card_id == 0){
				return Materialize.toast("กรุณาเลือก Project และ Card", 4000)
			}else{
				MoveModule.update(this.props.socket,project_id,card_id,task_id,(rsCard)=>{
					if(rsCard){
						window.location.href='/task/' + task_id;
					}else{
						return Materialize.toast("ไม่สามารถอัพเดตข้อมูลการย้ายได้ กรุณาลองใหม่อีกครั้ง");
					}
				});

			}
		}else{
			window.location.href='/task/' + task_id;
		}
	}

	render() {
		return (
			<div id="move-panel">
				<button onClick={this.popupShow.bind(this)} className="btn gray w100">Move</button>
				{this.state.popupState?
					<div id="move-panel-inner">
						<div id="move-project-panel" className="list-panel">
							<div className="list-panel-inner">
								<label className="subject-title">Project:</label>
								<Dropdown options={this.state.listProject} onChange={this._onSelectProject} value={this.state.selectedProject} placeholder="Select project" />
								<input type="hidden" name="project" value={this.state.selectedProject.value}/>
							</div>
						</div>
						<div id="move-card-panel" className="list-panel">
							<div className="list-panel-inner">
									<div>
									<label className="subject-title">Card:</label>
									<Dropdown options={this.state.listCard} onChange={this._onSelectCard} value={this.state.selectedCard} placeholder="Select card" />
									<input type="hidden" name="card" value={this.state.selectedCard.value} />
									</div>
							</div>
						</div>
						<button id="btn-move-confirm" onClick={this.moveSubmit.bind(this)} className="btn brown">OK</button>
					</div>
					: <span></span>
				}

			</div>
		);
	}
}

export default Move;
