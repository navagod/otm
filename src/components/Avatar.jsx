import React, { Component } from 'react';

class Avatar extends Component {
    render() {
        var name = "Unassign";
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
                <div className="avatar" style={{backgroundImage:"url('/uploads/"+avatar+"')"}}>&nbsp;</div>
            )
        } else {
            return (
                <div className="no_avatar"><div className="text" style={{backgroundColor:"#"+color}}>{first_two_char}</div></div>
            )
        }
    }
}

export default Avatar;