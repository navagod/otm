import React, { Component } from 'react';
import Link from 'react-router/Link'
import Common from './Module/Common'
class Notification extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listNotify:[],
			offset:0,
			hasmore:true
		}
	}
	componentDidMount() {
		
		Common.listNotification(this.props.socket,this.state.offset,(rs)=>{
			if(!rs){

			}else{
				this.setState({listNotify:rs,offset:8})
			}
		})
	}
	componentWillMount() {
		
	}
	loadmore(){
		
		var elmnt = document.getElementById("notify-body");
		var height = elmnt.scrollHeight - elmnt.clientHeight;
		var y = elmnt.scrollTop;
		if(y===height && this.state.hasmore){
			Common.listNotification(this.props.socket,this.state.offset,(rs)=>{
				if(!rs){
					this.setState({hasmore:false})
				}else{
					var {listNotify} = this.state
					rs.forEach(function(item,index){
						listNotify.push(item)
					})
					var {offset} = this.state
					offset = offset + 8
					this.setState({listNotify,offset})
				}
			})
		}
	}
	clickNotify(link,id){
		Common.clickNotification(this.props.socket,id,(rs)=>{
			if(!rs){

			}else{
				this.context.router.transitionTo(link)
				this.props.updateNotify()
			}
		})
		
	}
	makeAllReaded(){
		Common.readNotification(this.props.socket,(rs)=>{
			if(!rs){

			}else{
				var {listNotify} = this.state
				listNotify.forEach(function(item,i){
					listNotify[i]['readed'] = "yes"
				})
				this.setState({listNotify})
				this.props.updateNotify()
			}
		})
	}
	render() {
		var items = [];
		this.state.listNotify.map((item, i) => {
			var link = ''
			if(item.type === 'project'){
				link = `/project/${item.pid}`
			}else if(item.type === 'task'){
				link = `/task/${item.tid}`
			}else if(item.type === 'comment'){
				link = `/task/${item.tid}`
			}
			items.push(
				<div className={"notify-item "+item.readed} data-type={item.type} key={"notify-"+i} onClick={this.clickNotify.bind(this,link,item.id)}>
				<div className="notify-date">{timeConverterWithTime(item.date)}</div>
				<div className="notify-title">{item.title}</div>
				<div className="notify-detail">{item.detail}</div>
				</div>
				);
		});
		return (
			<div id="notify-wrap" onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave}>
			<div id="notify-head">
			Notifications
			<div id="readed" onClick={this.makeAllReaded.bind(this)}>X <span>Make all reade</span></div>
			<div className="clear"></div>
			</div>
			<div id="notify-body" onScroll={this.loadmore.bind(this)}>
			{items}
			</div>
			</div>
			);
	}
}
Notification.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default Notification;
