import React, { Component } from 'react'
import { Scrollbars } from 'react-custom-scrollbars';
import FilterLoad from "./Module/Filter";
import Link from 'react-router/Link'

var _ = require('lodash')


class Filter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            project: [],
            keyword: [],
            users: [],
            tags: [],
            task_status: [],
            taskList: []
        }

    }
    componentDidMount() {
        FilterLoad.loadProjectFilter(this.props.socket,5,(rs)=>{
            if(!rs){
                return Materialize.toast("Error Not Found Project Data.", 4000)
            }else{
                var project_data = [];
                var allProject = {name:"All",id:0,selected:false}
                project_data[0] = allProject;
                for (var i in rs) {
                    var project_refine = rs[i];
                    project_refine.selected = false;
                    project_data[rs[i].id] = project_refine;
                }
                this.setState({project:project_data});
            }
        })
        FilterLoad.loadUserFilter(this.props.socket,5,(rs)=>{
            if(!rs){
                return Materialize.toast("", 4000)
            }else{
                var user_data = [];
                for (var i in rs) {
                    var user_refined = rs[i];
                    user_refined.selected = false;
                    user_data[rs[i].id] = user_refined;
                }
                this.setState({users:user_data});
            }
        })
        FilterLoad.loadTagFilter(this.props.socket,5,(rs)=>{
            if(!rs){
                return Materialize.toast("", 4000)
            }else{
                var tags_data = [];
                for (var i in rs) {
                    var tags_refined = rs[i];
                    tags_refined.selected = false;
                    tags_data[rs[i].id] = tags_refined;
                }
                this.setState({tags:tags_data});
            }
        })
        var task_status_data = [];
        var status_array = Array("Active","Archive","Complete","Trash");
        for (var i in status_array) {
            var task_status = {status:status_array[i],id:i,selected:false}
            task_status_data[i] = task_status;
        }
        this.setState({task_status:task_status_data});
    }
    updateFilter() {
        var project_refined = [],keyword_refined = [],user_refined = [],tag_refined = [],status_refined = [];
        if (this.state.project[0].selected == false) {
            for (var i in this.state.project) {
                var data = this.state.project[i];
                if (data.selected == true) {
                    project_refined.push(data.id);
                }
            }
        }
        for (var i in this.state.keyword) {
            var data = this.state.keyword[i];
            if (data != null) {
                keyword_refined.push(data);
            }
        }
        for (var i in this.state.users) {
            var data = this.state.users[i];
            if (data.selected == true) {
                user_refined.push(data.id);
            }
        }
        for (var i in this.state.tags) {
            var data = this.state.tags[i];
            if (data.selected == true) {
                tag_refined.push(data.id);
            }
        }
        for (var i in this.state.task_status) {
            var data = this.state.task_status[i];
            if (data.selected == true) {
                status_refined.push(data.id);
            }
        }
        var filter = {project:project_refined,keyword:keyword_refined,user:user_refined,tags:tag_refined,status:status_refined}
        FilterLoad.loadFilter(this.props.socket,filter,(rs)=>{
            if(!rs){
                return Materialize.toast("Error Not Found Project Data.", 4000)
            }else{
                var date_data_list = [];
                for (var i in rs) {
                    var data = rs[i];
                    var tempList = [];
                    var tempDate = [];
                    var date_data = new Date(parseInt(data.start_date));
                    var dateIndex = date_data.getMonth()+"-"+date_data.getFullYear();
                    var dateString= date_data.getMonth()+" "+date_data.getFullYear();
                    if (typeof(date_data_list[dateIndex]) != "undefined") {
                        tempList = date_data_list[dateIndex].data;
                        tempDate = date_data_list[dateIndex].date_str;
                    } else {
                        tempDate = dateString;
                    }
                    tempList.push(data);
                    var data_obj_list = {id:dateIndex,data:tempList,date_str:tempDate};
                    date_data_list[dateIndex] = data_obj_list;
                }
                var task_list = [];
                for (var i in date_data_list) {
                    task_list.push(date_data_list[i]);
                }
                this.setState({taskList:task_list});
            }
        })

    }
    toggleProjectSelect(pid) {
        if (this.state.project[pid].selected == false) {
            this.state.project[pid].selected = true;
        } else {
            this.state.project[pid].selected = false;
        }
        this.updateFilter();
        this.setState({project:this.state.project})
    }
    toggleUserSelect(uid) {
        if (this.state.users[uid].selected == false) {
            this.state.users[uid].selected = true;
        } else {
            this.state.users[uid].selected = false;
        }
        this.updateFilter();
        this.setState({users:this.state.users});
    }
    toggleTagSelect(tid) {
        if (this.state.tags[tid].selected == false) {
            this.state.tags[tid].selected = true;
        } else {
            this.state.tags[tid].selected = false;
        }
        this.updateFilter();
        this.setState({tags:this.state.tags});
    }
    toggleTaskStatus(stid) {
        if (this.state.task_status[stid].selected == false) {
            this.state.task_status[stid].selected = true;
        } else {
            this.state.task_status[stid].selected = false;
        }
        this.updateFilter();
        this.setState({task_status:this.state.task_status});
    }
    addKeyword(keyword) {
        this.state.keyword.push(keyword);
        this.updateFilter();
        this.setState({keyword:this.state.keyword});

    }
    removeKeyword(array_key) {
        delete this.state.keyword[array_key];
        this.updateFilter();
        this.setState({keyword:this.state.keyword});
    }
	render() {
		return (
			<div className="" id='filter_panel'>
                <div className='filter_row'>
                    <ListPanel taskList={this.state.taskList}/>
                    <FilterPanel project={this.state.project}
                                 users={this.state.users}
                                 tags={this.state.tags}
                                 task_status={this.state.task_status}
                                 keyword={this.state.keyword}
                                 projectToggle={this.toggleProjectSelect.bind(this)}
                                 userToggle={this.toggleUserSelect.bind(this)}
                                 tagToggle={this.toggleTagSelect.bind(this)}
                                 taskStatusToggle={this.toggleTaskStatus.bind(this)}
                                 addKeyword={this.addKeyword.bind(this)}
                                 removeKeyword={this.removeKeyword.bind(this)}/>
                </div>
			</div>
		)
	}
}

/*class ProjectSelect extends Component {
    render() {
        if (this.props.selected) {
            return (
                <i className="material-icons project_select">check_box</i>
            )
        } else {
            return (
                <i className="material-icons project_select">check_box_outline_blank</i>
            )
        }
    }
}*/
class ProjectDisplay extends Component {
    selectedData() {
        if (this.props.data.selected) {
            return (
                <i className="material-icons project_select">check_box</i>
            )
        } else {
            return (
                <i className="material-icons project_select">check_box_outline_blank</i>
            )
        }
    }
    render() {
        return (
            <div className="filter_project" onClick={this.props.projectToggle.bind(this,this.props.data.id)}>
                {this.selectedData()}{this.props.data.name}
            </div>
        )
    }
}
class FilterPanel extends Component {
    state = {
        keyword:[]
    }
    constructor(props) {
        super(props);
        this.getKeyword = this.getKeyword.bind(this);
        this.inputKeypress = this.inputKeypress.bind(this);
        this.addKeyword = this.addKeyword.bind(this);
    }
    addKeyword() {
        this.props.addKeyword(this.state.keyword);
        this.setState({keyword: ""});
    }
    inputKeypress(event) {
        if(event.key == 'Enter'){
            this.addKeyword();
        }
    }
    getKeyword(event) {
        this.setState({keyword: event.target.value});
    }
    render() {
        return (
            <div className="filter_panel">
                <div className='filter_head'>Filter</div>
                <div className='filter_option'>
                    <div className='task_detail'>
                        <div className='filter_header'>
                            Project
                        </div>
                        <div className='filter'>
                            {this.props.project.map((project) =>
                                <ProjectDisplay key={project.id} data={project} projectToggle={this.props.projectToggle}/>
                            )}
                        </div>
                        <div className='filter_header'>
                            Keyword
                        </div>
                        <div className='filter'>
                            <div className='filter_keyword'>
                                <input type='text' className='input_keyword' onChange={this.getKeyword} value={this.state.keyword} onKeyPress={this.inputKeypress} />
                                <i className="material-icons" onClick={this.addKeyword}>add_box</i>
                            </div>
                            <div className='keyword_list'>
                                {this.props.keyword.map((keyword,index) =>
                                    <KeywordList key={index} keyword={keyword} index={index} removeKeyword={this.props.removeKeyword}/>
                                )}
                            </div>
                        </div>
                        <div className='filter_header'>
                            Assigned To
                        </div>
                        <div className='filter'>
                            <div className='filter_assign'>
                                {this.props.users.map((users) =>
                                    <UserList key={users.id} data={users} userToggle={this.props.userToggle}/>
                                )}
                            </div>
                        </div>
                        <div className='filter_header'>
                            Tags
                        </div>
                        <div className='filter'>
                            <div className='filter_tag'>
                                {this.props.tags.map((tag) =>
                                    <TagsList key={tag.id} data={tag} tagToggle={this.props.tagToggle} />
                                )}
                            </div>
                        </div>
                        <div className='filter_header'>
                            Status
                        </div>
                        <div className='filter'>
                            <div className='filter_status'>
                                {this.props.task_status.map((status) =>
                                    <StatusList key={status.id} data={status} statusToggle={this.props.taskStatusToggle} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
class StatusList extends Component {
    selectedData() {
        if (this.props.data.selected) {
            return (
                <i className="material-icons status_select">check_box</i>
            )
        } else {
            return (
                <i className="material-icons status_select">check_box_outline_blank</i>
            )
        }
    }
    render() {
        return (
            <div className='filter_status_list' onClick={this.props.statusToggle.bind(this,this.props.data.id)}>
                {this.selectedData()}{this.props.data.status}
            </div>
        )
    }
}
class TagsList extends Component {
    checkSelected() {
        if (this.props.data.selected == true) {
            return "selected active";
        } else {
            return "selected";
        }
    }
    render() {
        return (
            <div className="tagsList" onClick={this.props.tagToggle.bind(this,this.props.data.id)}>
                <div className={"tagColor "+this.props.data.color} style={{background:this.props.data.bg,color:this.props.data.f}}>
                    {this.props.data.text}
                </div>
                <i className={"material-icons "+this.checkSelected()}>check_circle</i>
            </div>
        )
    }
}
class UserList extends Component {
    checkAvatar() {
        var avatar = this.props.data.avatar;
        var name = this.props.data.name;
        var first_two_char = name.substring(0,2).toUpperCase();
        if (avatar.length > 0) {
            return <div className="avatar" style={{backgroundImage:"url('/upload/"+avatar+"')"}}>&nbsp;</div>
        } else {
            return <div className="no_avatar">&nbsp;<div className="text" style={{backgroundColor:"#"+this.props.data.color}}>{first_two_char}</div></div>
        }
    }
    checkSelected() {
        if (this.props.data.selected == true) {
            return "selected active";
        } else {
            return "selected";
        }
    }
    render() {
        return (
            <div className="userList" onClick={this.props.userToggle.bind(this,this.props.data.id)}>
                {this.checkAvatar()}
                <div className="userName">{this.props.data.name}</div>
                <i className={"material-icons "+this.checkSelected()}>check_circle</i>
            </div>
        )
    }
}
class DatePanel extends Component {
    render() {
        return (
            <div className="date_panel">
                <div className='date_display'>
                    {this.props.data.date_str}
                </div>
                <div className="task_in_date">
                    {this.props.data.data.map((task_list,index) =>
                        <TaskListInDate key={index} data={task_list}/>
                    )}
                </div>
            </div>
        )
    }
}
class TagsListInTask extends Component {
    render() {
        return (
            <div className="tagsList">
                <div className={"tagColor "+this.props.data.properties.color} style={{background:this.props.data.properties.bg_color,color:this.props.data.properties.f_color}}>
                    {this.props.data.properties.text}
                </div>
            </div>
        )
    }
}
class TaskListInDate extends Component {
    render() {
        return (
            <div className="task_in_date_list">
                <Link to={`/task/${this.props.data.id}`}>
                <div className='task_detail'>
                    <div className='task_name'>
                        {this.props.data.title}
                    </div>
                    <div className='tag_panel'>
                        {this.props.data.tags.map((tag,index) =>
                            <TagsListInTask key={index} data={tag} />
                        )}
                    </div>
                </div>
                </Link>
            </div>
        )
    }
}
class KeywordList extends Component {
    render() {
        return (
            <div className='keyword' onClick={this.props.removeKeyword.bind(this,this.props.index)}>
                <div className='keyword_text'>
                    {this.props.keyword}
                </div>
                <i className="material-icons">clear</i>
            </div>
        )
    }
}
class ListPanel extends Component {
    render() {
        return (
            <div className="task_list_panel">
                <Scrollbars className='scroll_list'>
                    {this.props.taskList.map((date_list,index) =>
                        <DatePanel key={date_list.id} data={date_list}/>
                    )}
                </Scrollbars>
            </div>
        )
    }
}

export default Filter
