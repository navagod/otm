import React, { Component } from 'react'
class Loading extends Component {
	constructor(props) {
		super(props)
		this.state = {
			error: false,
			loading: this.props.loading,
		}
	}
	render() {
		return (
			<div className="loading-panel active" >
				<div className="loading-panel-wrapper">
					<div className="preloader-wrapper big active">
					    <div className="spinner-layer spinner-blue-only">
					      <div className="circle-clipper left">
					        <div className="circle"></div>
					      </div><div className="gap-patch">
					        <div className="circle"></div>
					      </div><div className="circle-clipper right">
					        <div className="circle"></div>
					      </div>
					    </div>
					</div>
				</div>
			</div>
		);
	}
}
export default Loading;
