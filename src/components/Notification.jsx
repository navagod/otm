import React, { Component } from 'react';
import Link from 'react-router/Link'
import Common from './Module/Common'

class Notification extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listNotify:[],
			offset:0,
		}
	}
	componentDidMount() {
		
		Common.listNotification(this.props.socket,this.state.offset,(rs)=>{
			if(!rs){

			}else{
				console.log(rs)
				// this.setState({notify:rs})
			}
		})
	}
	componentWillMount() {
		
	}
	render() {
		return (
			<div id="notify-wrap" onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave}>
			<div id="notify-head">
			Notifications
			<div id="readed">X</div>
			<div className="clear"></div>
			</div>
			<div id="notify-body">
			{this.state.listNotify.map((item, i) =>

				<Link to={`/task/${item.id}`} key={"notify-"+i}>
				<div className="notify-item">
				<div className="notify-date">06/12/2016 10:10:10</div>
				<div className="notify-title">title</div>
				<div className="notify-detail">detail</div>
				</div>
				</Link>

			)}
			</div>
			</div>
			);
		}
	}

	export default Notification;
