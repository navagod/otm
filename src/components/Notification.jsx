import React, { Component } from 'react';
import Link from 'react-router/Link'

class Notification extends Component {
	render() {
		return (
			<div id="notify-wrap">
			<div id="notify-head">
			Notifications
			<div id="readed">X</div>
			<div className="clear"></div>
			</div>
			<div id="notify-body">
			<Link to="">
			<div className="notify-item">
			<div className="notify-date">06/12/2016 10:10:10</div>
			<div className="notify-title">06/12/2016 10:10:10</div>
			<div className="notify-detail">06/12/2016 10:10:10</div>
			</div>
			</Link>
			</div>
			</div>
			);
	}
}

export default Notification;
