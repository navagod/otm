import React, { Component } from 'react';
import auth from './Module/Auth';
import {Link} from 'react-router';
import projects from './Module/Project'
import Task from './Task'
import PopupPage from './PopupPage'
import Router from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Redirect from 'react-router/Redirect'
import NavigationPrompt from 'react-router/NavigationPrompt'
var _ = require('lodash')
const MatchWhenAuthorized = ({ component: Component, ...rest }) => (
	<Match {...rest} render={props => (
		auth.loggedIn() ? (
			<Component {...props} {...rest} />
			) : (
			<Redirect to='/login'/>
			)
			)}/>
	)
class Project extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:"",
			projectId:this.props.params.projectId || "",
			cardList:[],
			addCardEnable:false,
			mouseDownInput:false,
			projectTitle:"",
			dialogEdit:false,
			cardEditTitle:"",
			cardEditColor:"",
			cardEditIcon:"",
			cardEditId:"",
			cardEditPosition:0,
			activeTask:0,
			archiveTask:0,
			trashTask:0,
			completeTask:0,

		}
	}
	componentDidMount(){
		// window.addEventListener('mousedown', this.inputClick.bind(this), false);
		$( "#card-sort" ).sortable({update: this.handleSortCardUpdate.bind(this)
		}).disableSelection();
		this.projectsListCard.bind(this)()
		this.taskCount.bind(this)();
		this.props.socket.on('card:updateSort', this._updateSortCardList.bind(this));
		this.props.socket.on('card:updateAddList', this._updateAddCardList.bind(this));
		this.props.socket.on('card:updateEditCard', this._updateEditCard.bind(this));
		this.props.socket.on('project:countStatus', this._countStatus.bind(this));
		cal_list();
	}
	componentWillMount() {
		
	}
	componentDidUpdate(prevProps, prevState){
		cal_list();

	}
	_countStatus(data){
		console.log("data",data);
	}
	_updateAddCardList(data){
		if(data.pid == this.state.projectId){
			var {cardList} = this.state;
			cardList.push(data.lists);
			this.setState({cardList});
		}
	}
	_updateSortCardList(data){
		if(data.pid == this.state.projectId){
			this.setState({ cardList: data.lists });
		}
	}
	_updateEditCard(data){
		var {cardList} = this.state;
		var index = _.findIndex(cardList,{'id':data.id})
		cardList.splice(index, 1, {id:data.id,title:data.title,color:data.color,icon:data.icon,position:data.position});
		this.setState({
			cardList,
			cardEditTitle:"",
			cardEditColor:"",
			cardEditIcon:"",
			cardEditId:"",
			cardEditPosition:0
		});
	}
	projectsListCard(){
		if(this.state.projectId !==""){
			projects.listCard(this.props.socket,this.state.projectId,(rs)=>{
				if(!rs){

				}else{
					this.setState({projectTitle:rs.board,cardList:rs.lists});
				}
			})
		}
	}
	taskCount() {
		projects.getCount(this.props.socket,this.state.projectId, (rs)=>{
			this.setState({activeTask:(rs.active > 0 ? rs.active : 0)});
			this.setState({archiveTask:(rs.archive > 0 ? rs.archive : 0)});
			this.setState({trashTask:(rs.trash > 0 ? rs.trash : 0)});
			this.setState({completeTask:(rs.complete > 0 ? rs.complete : 0)});
		});

	}
	componentWillReceiveProps(nextProps){
		console.log(nextProps)
	}
	handleSortCardUpdate(event, ui){
		var newItems = this.state.cardList;
		var $node = $('#card-sort');
		var ids = $node.sortable('toArray', { attribute: 'data-id' });
		ids.forEach(function (i, index) {
			var elementPos = newItems.map(function(x) {return x.id;}).indexOf(parseInt(i));
			var item = newItems[elementPos];
			item.position = index;
		});
		$node.sortable('cancel');
		let store_state = this.state.cardList
		this.setState({ cardList: newItems });
		projects.updateCard(this.props.socket,this.state.projectId,newItems,(rs)=>{
			if(!rs){
				this.setState({ cardList: store_state });
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}
		})
	}


	addCard(event){
		if(!this.state.addCardEnable){
			this.setState({addCardEnable:true})
		}
	}
	inputClick(e) {
		if (this.state.mouseDownInput) {
			return;
		}

		this.setState({
			addCardEnable: false
		})
	}
	mouseDownHandler() {
		this.state.mouseDownInput = true;
	}

	mouseUpHandler() {
		this.state.mouseDownInput = false;
	}
	submitAdd(e){
		e.preventDefault()
		const title = this.refs.addTitle.value
		const sortNum = parseInt($('.card-item').length) + 1
		if(title == ""){
			return false
		}
		projects.addCard(this.props.socket,title,this.state.projectId,sortNum,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {cardList} = this.state;
				cardList.push(rs.lists);
				this.setState({cardList,addCardEnable: false});
			}
		})
	}
	esc(e){
		if(e.key=="Escape"){
			this.setState({
				addCardEnable: false
			})
		}
	}

	editCard(id){
		if(!this.state.dialogEdit){
			projects.getCard(this.props.socket,id,(rs)=>{
				if(!rs){
					return Materialize.toast("เกิดข้อผิดพลาด ไม่พบข้อมูลนี้", 4000)
				}else{
					this.setState({dialogEdit:true,
						cardEditTitle:rs.title,
						cardEditColor:rs.color,
						cardEditIcon:rs.icon,
						cardEditPosition:rs.position,
						cardEditId:id})
				}
			})

		}
	}

	closeEditCard(e){
		this.setState({dialogEdit:false})
	}
	submitEditCard(event){
		event.preventDefault()
		const title = this.refs.card_edit_name.value
		const color = this.refs.color_edit_card.value
		const icon = this.refs.icon_edit_card.value
		const position = this.state.cardEditPosition
		projects.saveCard(this.props.socket,title,color,icon,position,this.state.cardEditId,(rs)=>{
			if(!rs){
				return Materialize.toast("เกิดข้อผิดพลาด", 4000)
			}else{
				var {cardList} = this.state;
				var index = _.findIndex(cardList,{'id':this.state.cardEditId})
				cardList.splice(index, 1, {id:this.state.cardEditId,title:title,color:color,icon:icon,position:position});
				this.setState({
					cardList,
					cardEditTitle:"",
					cardEditColor:"",
					cardEditIcon:"",
					cardEditId:"",
					cardEditPosition:0,
					dialogEdit:false
				});
			}
		})
	}
	changeTitleEdit(e){
		this.setState({cardEditTitle:e.target.value});
	}
	setColor(color){
		this.setState({cardEditColor:color});
	}
	setIcon(icon){
		this.setState({cardEditIcon:icon});
	}
	classIcon(icon){
		if(icon == this.state.cardEditIcon){
			return "icon-select active";
		}else{
			return "icon-select";
		}
	}
	classColor(color){
		if(color == this.state.cardEditColor){
			return 'color-select active ' + color
		}else{
			return 'color-select ' + color
		}
	}
	deletePanel(event){
		event.preventDefault()
	}
	RerenderProject(pid){
		this.setState({projectId:pid})
		this.projectsListCard.bind(this)()
	}
	render() {
		var card_items = this.state.cardList
		card_items.sort(function(a,b){return a['position'] > b['position']})

		var colors = ["red","blue","pink","yellow","green","orange","black","purple"]
		var icons = ["info_outline","input","label","language","query_builder","perm_media","power_settings_new","print","textsms","web","today","translate","settings","my_location","report_problem","pageview","verified_user","stars","error_outline","loyalty","mode_edit"]
		return (
			<Router>
			<div id="project-page">
			<nav>
			<div className="nav-wrapper blue">
				<div className="col s12" id="project-title">
					<div className='project_name'>
						{this.state.projectTitle}
					</div>
					<div className='taskCount'>
						<abbr title='Active'><i className="material-icons inline">play_for_work</i>{this.state.activeTask}</abbr>
						<abbr title='Complete'><i className="material-icons inline">check_circle</i>{this.state.completeTask}</abbr>
						<abbr title='Archive'><i className="material-icons inline">archive</i>{this.state.archiveTask}</abbr>
						<abbr title='Trash'><i className="material-icons inline">delete</i>{this.state.trashTask}</abbr>
					</div>
				</div>
			</div>
			</nav>
			<div id="list-cards">
			<div id="inner-list">
			<div id="card-sort">
			{ card_items.map((card_item, i) =>
				<div className="card-item connectedSortable" id={"c-"+card_item.id} data-id={card_item.id} key={i}>
					<div className={"card-header " + card_item.color}>
						<div className="card-icon"><i className="material-icons">{card_item.icon}</i></div>
						<div className="card-title">{card_item.title}</div>
						<div className="card-menu" onClick={this.editCard.bind(this,card_item.id)}><i className="material-icons tiny">mode_edit</i></div>
					</div>
					<div className="card-body"><Task projectId={this.state.projectId} socket={this.props.socket} updateTaskCount={this.taskCount.bind(this)} cardId={card_item.id} /></div>
				</div>
				)}
			</div>




			{this.state.addCardEnable?
				<div className="card-item" id="add-item">
				<div className="card-header black">
				<div className="card-icon"><i className="material-icons">info_outline</i></div>
				<div className="card-title">
				<form onSubmit={this.submitAdd.bind(this)}>
				<input type="text" id="input-card" ref="addTitle" maxLength="50" onMouseDown={this.mouseDownHandler.bind(this)} onMouseUp={this.mouseUpHandler.bind(this)} onKeyDown={this.esc.bind(this)} required/>
				</form>
				</div>
				</div>
				<div className="card-body"><i className="material-icons large">info_outline</i><br/>Add New Panel</div>
				</div>
				:null}
				<div id="add-card" onClick={this.addCard.bind(this)}><i className="material-icons">playlist_add</i></div>
				</div>
				</div>

				{this.state.dialogEdit ?
					<div>
					<div id="editCard" className="modal modal-fixed-footer open">
					<form onSubmit={this.submitEditCard.bind(this)}>
					<div className="modal-content">
					<div>
					<div className="row">
					<div className="input-field col s12">
					<input id="card_edit_name" ref="card_edit_name" type="text" onChange={this.changeTitleEdit.bind(this)} className="validate" maxLength="50" value={this.state.cardEditTitle}  placeholder="Name" required />
					<label htmlFor="card_edit_name" className="active">Title</label>
					</div>
					</div>

					<div className="row">
					<div className="input-field col s12">
					<input type="hidden" ref="color_edit_card"  value={this.state.cardEditColor} />
					<strong>Color</strong><br/>
					{colors.map((color_item,i)=>
						<div className={this.classColor(color_item)} key={i} onClick={this.setColor.bind(this,color_item)}></div>
						)}
					</div>
					</div>

					<div className="row">
					<div className="input-field col s12">
					<input type="hidden" ref="icon_edit_card"  value={this.state.cardEditIcon} />
					<strong>Icon</strong><br/>
					{icons.map((icon_item,i)=>
						<div className={this.classIcon(icon_item)} key={i} onClick={this.setIcon.bind(this,icon_item)}><i className="material-icons">{icon_item}</i></div>
						)}
					</div>
					</div>
					</div>
					</div>
					<div className="modal-footer">

					<button type="submit" className="waves-effect waves-green btn-flat">Save</button>
					<button type="button" className="waves-effect waves-red btn-flat" id="closeEditCard" onClick={this.closeEditCard.bind(this)}>Close</button>
					<button type="button" className="waves-effect waves-red btn-flat red" onClick={this.deletePanel.bind(this)}>Delete</button>
					
					</div>
					</form>
					</div>
					<div className="lean-overlay" id="materialize-lean-overlay-2"></div>
					</div>
					:null
				}
				<MatchWhenAuthorized pattern="/task/:taskId" onRender={this.RerenderProject.bind(this)} socket={this.props.socket} updateTaskCount={this.taskCount.bind(this)} component={PopupPage} />
				</div>
				</Router>
				);
	}


}

export default Project;