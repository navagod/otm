import React, { Component } from 'react';

class Avatar extends Component {
    state = {
        userTooltipDisplay:"none"
    }
    showTooltips() {
        this.setState({userTooltipDisplay:"block"});
    }
    hideTooltips() {
        this.setState({userTooltipDisplay:"none"});
    }
    render() {
        var name = "Unassigned";
        var first_two_char = "";
        var color = "";
        var avatar = "";
        if (typeof(this.props.name) != "undefined" && this.props.name != null) {
            name = this.props.name;
            first_two_char = name.substring(0,2).toUpperCase();
            avatar = this.props.avatar;
            color = this.props.color;
        }
        if (typeof(this.props.avatar) != "undefined" && avatar.length > 0) {
            return (
                <div className='user_display'>
                    <div className="user_tooltips" style={{display:this.state.userTooltipDisplay}}>
                        {name}
                    </div>
                    <div className="avatar" style={{backgroundImage:"url('/uploads/"+avatar+"')"}} data-position="top" data-delay="50" data-tooltip={name} onMouseOver={this.showTooltips.bind(this)} onMouseOut={this.hideTooltips.bind(this)}>

                    </div>
                </div>
            )
        } else {
            return (
                <div className='user_display'>
                    <div className="user_tooltips" style={{display:this.state.userTooltipDisplay}}>
                        {name}
                    </div>
                    <div className="no_avatar" data-position="top" data-delay="50" data-tooltip={name} onMouseOver={this.showTooltips.bind(this)} onMouseOut={this.hideTooltips.bind(this)}>
                        <div className="text" style={{backgroundColor:"#"+color}}>{first_two_char}</div>
                    </div>
                </div>
            )
        }
    }
}

export default Avatar;