import React, { Component } from 'react'
import {Link} from 'react-router'
import {Dropdown,NavItem} from 'react-materialize'
import Tasks from './Module/Task'
import Todo from './Todo'
import Tags from './Tags'
import Loading from './Loading';
import Move from './Move';
import Avatar from './Avatar';
var Datetime = require('react-datetime');
var Dropzone = require('react-dynamic-dropzone');

class TaskDetail extends Component {
    constructor(props) {
        super(props)
        var taskId = null;
        if (typeof(this.props.params) != "undefined") {
            taskId = this.props.params.taskId;
        } else {
            taskId = this.props.taskId;
        }
        this.state = {
            error: false,
            projectId:"",
            taskId:taskId,
            taskData:[],
            socket:this.props.socket,
            comments:[],
            attachments:[],
            showTodo:false,
            selectUser:false,
            listUsers:[],
            dropdownIsActive: false,
            dropdownIsVisible: false,
            currentTags:[],
            allTags:[],
            showTag:false,
            loading:true,
            task_status:"active"
        }
        this._hideDropdown = this._hideDropdown.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onOpenClick = this.onOpenClick.bind(this);
        this.onAttachmentRemoveClick = this.onAttachmentRemoveClick.bind(this);
    }
    componentDidMount() {
        if (this.state.taskId != null) {
            if (this.state.taskId != this.props.taskId && typeof(this.props.params) == "undefined") {
                this.setState({taskId:this.props.taskId});
            }
            Tasks.get(this.state.socket,this.state.projectId,this.state.taskId,(rs)=>{
                if(!rs){
                    return Materialize.toast("เกิดข้อผิดพลาด ไม่พบ Task นี้", 4000)
                }else{
                    var {taskData} = this.state
                    taskData = rs[0]
                    this.setState({task_status:rs[0]["t.status"]});
                    this.setState({taskData,projectId:rs[0]["ID(p)"]})
                    var projectId = rs[0]["ID(p)"];
                    if(rs[0]['todo']>0){
                        this.setState({showTodo:true})
                    }
                    Tasks.listComment(this.state.socket,projectId,this.state.taskId,(rsc)=>{
                        if(!rsc){

                        }else{
                            var {comments} = this.state
                            comments = rsc
                            this.setState({comments})
                        }
                    })
                    Tasks.listUsers(this.state.socket,projectId,(rs)=>{
                        if(!rs){
                            return Materialize.toast("ไม่พบสมาชิกที่เข้าร่วมโปรเจคนี้", 4000)
                        }else{
                            var {listUsers} = this.state
                            listUsers = rs
                            this.setState({listUsers})
                        }
                    })
                    Tasks.currentTag(this.state.socket,this.state.taskId,(rs)=>{
                        if(!rs){

                        }else{
                            var {currentTags} = this.state
                            currentTags = rs
                            this.setState({currentTags})
                        }
                    })
                    Tasks.allTag(this.state.socket,projectId,(rs)=>{
                        if(!rs){

                        }else{
                            var {allTags} = this.state
                            allTags = rs
                            this.setState({allTags})
                        }
                    })
                    Tasks.listAttachment(this.state.socket,projectId,this.state.taskId,(list_attachment)=>{
                        if(!list_attachment){

                        }else{
                            this.setState({attachments:list_attachment})
                        }
                    })
                    this.setState({loading:false});
                }
            })
        }
    }
    componentWillUnmount() {

    }
    _stopPropagation(e) {
        e.stopPropagation();
    }

    _toggleDropdown() {
        this.setState({ dropdownIsVisible: true });
        window.addEventListener('click', this._hideDropdown, false);
    }


    _hideDropdown() {
        const { dropdownIsActive } = this.state;
        if (!dropdownIsActive) {
            this.setState({ dropdownIsVisible: false });
            window.removeEventListener('click', this._hideDropdown, false);
        }
    }


    _handleFocus() {
        this.setState({ dropdownIsActive: true });
    }

    _handleBlur() {
        this.setState({
            dropdownIsActive: false,
        });
    }
    changeTitle(event){
        var {taskData} = this.state
        taskData["t.title"] = event.target.value
        this.setState({taskData})
    }
    changeDetail(event){
        var {taskData} = this.state
        taskData["t.detail"] = event.target.value
        this.setState({taskData})
    }
    updateTask(event){
        var v = this.state.taskData["t.title"]
        if(v===""){
            this.refs.taskTitle.focus();
            return Materialize.toast("กรุณาใส่ข้อหัว", 4000)
        }else{
            Tasks.save(this.state.socket,this.state.taskData,this.state.taskId,(rs)=>{
                if(!rs){
                    return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
                }
            })
        }
    }
    submitComment(event){
        event.preventDefault()
        var c = this.refs.commentInput.value
        if(c===""){
            this.refs.commentInput.focus();
            return Materialize.toast("กรุณาใส่ข้อความ", 4000)
        }else{
            Tasks.addComment(this.state.socket,c,this.state.taskId,(rs)=>{
                if(!rs){
                    return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
                }else{
                    var {comments} = this.state
                    comments = rs
                    this.setState({comments})
                }
                this.refs.commentInput.value = ""
            })
        }
    }
    validDateStart(current){
        return current.day() !== 0 && current.day() !== 6 && current.diff(moment()) >= -50000000;
    }
    validDateEnd(current){
        var d = moment.unix(Math.round(parseInt(this.state.taskData['t.startDate']) / 1000))
        return current.day() !== 0 && current.day() !== 6 && current.diff(d) >= -50000000;
    }
    selectStartDate(data){
        var tm = moment(data).valueOf()

        Tasks.changeStartDate(this.state.socket,this.state.taskId,tm,(rs)=>{
            if(!rs){
                return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
            }else{
                var {taskData} = this.state
                taskData['t.startDate'] = tm
                this.setState({taskData})
            }
        })
    }
    selectEndDate(data){
        var tm = moment(data).valueOf()
        Tasks.changeEndDate(this.state.socket,this.state.taskId,tm,(rs)=>{
            if(!rs){
                return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
            }else{
                var {taskData} = this.state
                taskData['t.endDate'] = tm
                this.setState({taskData})
            }
        })
    }
    showTodoList(){
        this.setState({showTodo:true})
    }
    activeListUser(data){

        Tasks.assignUser(this.state.socket,data.id,this.state.taskId,(rs)=>{
            if(!rs){
                return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
            }else{
                var {taskData} = this.state
                taskData['ua.Name'] = data.name
                taskData['ua.Avatar'] = data.avatar
                taskData['ua.Color'] = data.color
                this.setState({taskData})
            }
        })
    }
    statusTask(status){
        Tasks.setStatusTask(this.state.socket,status,this.state.taskId,(rs)=>{
            if(!rs){
                return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
            } else {
                this.setState({task_status:status});
            }
        })
    }
    clickTag(id,color,text,bg,f){
        var index = _.findIndex(this.state.currentTags,{'ID(l)':id})
        let mode = ''
        if(index >= 0){
            mode = 'remove'
        }else{
            mode = 'add'
        }
        Tasks.setTagTask(this.state.socket,this.state.taskId,mode,id,(rs)=>{
            if(!rs){
                return Materialize.toast("เกิดข้อผิดพลาด กรุณารีเฟรสหน้าใหม่", 4000)
            }else{
                if(mode==='add'){
                    let {currentTags} = this.state
                    currentTags.push({
                        'ID(l)':id,
                        'l.color':color,
                        'l.text':text,
                        'l.bg_color':bg,
                        'l.f_color':f
                    })
                    this.setState({currentTags})
                }else{
                    let {currentTags} = this.state
                    currentTags.splice(index,1)
                    this.setState({currentTags})
                }
            }
        })
    }
    openTags(){
        this.setState({showTag:true})
    }
    closeTags(){
        this.setState({showTag:false})
        Tasks.currentTag(this.state.socket,this.state.taskId,(rs)=>{
            if(!rs){

            }else{
                var {currentTags} = this.state;
                currentTags = rs
                this.setState({currentTags})
            }
        })
        Tasks.allTag(this.state.socket,this.state.projectId,(rs)=>{
            if(!rs){

            }else{
                var {allTags} = this.state
                allTags = rs
                this.setState({allTags})
            }
        })
    }
    classTag(id){
        let index = _.findIndex(this.state.currentTags,{'ID(l)':id})
        if(index >= 0){
            return "tag-item active "
        }else{
            return "tag-item "
        }
    }
    onChangeName(e){
        this.setState({U_name:e.target.value});
    }
    onDragEnter(e) {
        this.setState({ isReceiverOpen: true });
    }
    onDragOver(e) {
        // your codes here
    }
    onDragLeave(e) {
        this.setState({ isReceiverOpen: false });
    }
    onOpenClick(e){
        this.refs.dropzone.open();
    }
    onDrop(acceptedFiles) {
        if(acceptedFiles.length > 0){
            this.setState({loading:true});
            const uid = localStorage.uid
            var _this = this;
            var files = acceptedFiles;
            var file_count = files.length;
            var file_list_count = 0;
            files.forEach((file)=> {
                var reader = new window.FileReader();
                var socket_send = this.props.socket;
                reader.fileName = file.name;
                reader.readAsBinaryString(file);
                reader.onload = function(event) {
                    var binary_file = event.target.result;
                    var file_name = event.target.fileName;
                    var extension = file_name.split('.').pop().toLowerCase();
                    Tasks.addAttachment(socket_send,binary_file,extension,_this.state.taskId,(list_attachment)=>{
                        file_list_count++;
                        if (!list_attachment){
                            return Materialize.toast("เกิดข้อผิดพลาด", 4000)
                        }else{
                            _this.setState({attachments:list_attachment})
                            if(file_count == file_list_count){
                                _this.setState({loading:false});
                            }
                            return Materialize.toast("อัพโหลดไฟล์เรียบร้อยแล้ว", 4000)
                        }
                    })
                }
            });
        }else{
            alert("ไม่สามารถอัพโหลดไฟล์ได้");
        }
    }

    onAttachmentRemoveClick(attachment_id,file_name){
        if (confirm('Do you want to delete?')) {
            this.setState({loading:true});
            Tasks.removeAttachment(this.props.socket,attachment_id,this.state.taskId,file_name,(list_attachment)=>{
                if (!list_attachment){
                    return Materialize.toast("เกิดข้อผิดพลาด", 4000)
                }else{
                    this.setState({attachments:list_attachment})
                    this.setState({loading:false});
                    return Materialize.toast("ลบไฟล์เรียบร้อยแล้ว", 4000)
                }
            })
        }
    }
    checkTaskId() {
        if (typeof(this.props.params) == "undefined" && typeof(this.props.taskId) == "undefined") {
            return "none";
        } else {
            if (this.state.taskId != null) {
                return "block";
            } else {
                return "none";
            }
        }
    }
    closeTaskDetail() {
        if (typeof(this.props.closeTask) != "undefined") {
            return <div id="closePopup" onClick={this.props.closeTask.bind(this)}>×</div>
        } else {
            return <div id="closePopup"><Link to={`/project/${this.state.projectId}`}>×</Link></div>
        }
    }
    render() {
        return (
            <div style={{display:this.checkTaskId()}}>
                <div id="inner" className="element-animation">
                    {this.closeTaskDetail()}
                    <div id="menuPopup">
                        <StatusAction status={this.state.task_status} changeStatus={this.statusTask.bind(this)}/>
                    </div>
                    <div className="clear"></div>
                    <hr/>
                    <div className="row">
                        <div className="col s8">
                            <textarea className="hiddenInput title" ref="taskTitle" value={this.state.taskData["t.title"]} onChange={this.changeTitle.bind(this)} onBlur={this.updateTask.bind(this)}></textarea>
                            <textarea className="hiddenInput detail" value={this.state.taskData["t.detail"]} onChange={this.changeDetail.bind(this)} placeholder="No detail." onBlur={this.updateTask.bind(this)}></textarea>
                            <div id="todoList">
                                {this.state.showTodo?
                                    <Todo tid={this.state.taskId} socket={this.state.socket}/>
                                    :
                                    <div className="addSubject" onClick={this.showTodoList.bind(this)}><i className="material-icons">note_add</i> Add Checklist Itme</div>
                                }

                            </div>
                            <div id="fileList">
                                <div className="addSubject" onClick={this.onOpenClick}><i className="material-icons">note_add</i> Attachment</div>
                                <Dropzone ref="dropzone" onDrop={this.onDrop} socket={this.socket}>
                                    <div>Try dropping some files here, or click to select files to upload.</div>
                                </Dropzone>
                                <div id="attachment-detail">
                                    { this.state.attachments.map((at_item,i)=>

                                            <div id={"att-" + at_item.id} className="attachemnt-item" key={"attachemnt-"+this.state.taskId+"-"+i}>
                                                <a href={"/uploads/attachment/"+at_item["a.file_name"]} target="_blank">
                                                    { at_item["a.file_type"] == "png" || at_item["a.file_type"] == "jpg" || at_item["a.file_type"] == "jpeg" || at_item["a.file_type"] == "gif"?
                                                        <div className="img-picture img-100" style={{backgroundImage: 'url(/uploads/attachment/' + at_item["a.file_name"] + ')'}}></div>
                                                        : <div className={"img-file img-100 img-"+at_item["a.file_type"]}></div>
                                                    }
                                                </a>
                                                <div className="attachment-rm circle" onClick={this.onAttachmentRemoveClick.bind(this,at_item.id,at_item["a.file_name"])} data-id={at_item.id}>x</div>
                                            </div>
                                        // {i == 0 ? <div className="card-action"></div> : <div></div>}
                                    )}
                                    <div className="card-action"></div>
                                </div>
                            </div>
                            <div id="activity">
                                <h5>Activity</h5>
                                <div id="inputComment">
                                    <form onSubmit={this.submitComment.bind(this)}>
                                        <textarea type="text" className="inputComment" ref="commentInput" placeholder="Enter comment" />
                                        <button type="submit" className="btn-flat green right">Say it!</button>
                                    </form>
                                    <div className="clear"></div>
                                </div>
                                <div id="commetnList">
                                    { this.state.comments.map((c_item,ic)=>
                                        <div className="activity-item" key={"comment-"+this.state.taskId+"-"+ic}>
                                            <div className="activity-avatar">

                                                {c_item["u.Avatar"]
                                                    ? <img  src={"/uploads/"+c_item["u.Avatar"]} className="avatar-mini circle responsive-img" width="40" height="40" />
                                                    : <img src={"https://placeholdit.imgix.net/~text?txtsize=15&txt="+c_item["u.Name"].charAt(0).toUpperCase()+"&w=40&h=40&txttrack=0&txtclr=000000&bg="+ c_item["u.Color"]} className="circle  responsive-img" />
                                                }

                                            </div>
                                            <div className="activity-detail">
                                                <div>Posted : {timeConverterWithTime(c_item["c.date"])}</div>
                                                {c_item["c.text"]}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>

                                </div>
                            </div>
                        </div>
                        <div className="col s4 bg-gray">
                        	<Move socket={this.props.socket} taskId={this.state.taskId}/>




                            <Dropdown trigger={
                                <div className="userAssigned">
                                    <div>Assigned to </div>
                                    <Avatar name={this.state.taskData['ua.Name']} avatar={this.state.taskData['ua.Avatar']} color={this.state.taskData['ua.Color']} />
                                    <div>{this.state.taskData['ua.Name']}</div>
                                </div>
                            }>
                                { this.state.listUsers.map((user, i) =>
                                    <NavItem key={'asu-'+i} onClick={this.activeListUser.bind(this,user)}>
                                        {user.name}
                                    </NavItem>
                                )}
                            </Dropdown>


                            <div className="rightBarItem">
                                <strong>Start Date : </strong>
                                <Datetime isValidDate={this.validDateStart.bind(this)} onChange={this.selectStartDate.bind(this)} value={moment.unix(Math.round(parseInt(this.state.taskData['t.startDate']) / 1000))} />
                                <strong>Due Date : </strong>
                                <Datetime isValidDate={this.validDateEnd.bind(this)} onChange={this.selectEndDate.bind(this)} value={moment.unix(Math.round(parseInt(this.state.taskData['t.endDate']) / 1000))} />
                            </div>
                            <div className="rightBarItem" id="tags"
                                 onMouseOver={this._handleFocus.bind(this)}
                                 onMouseLeave={this._handleBlur.bind(this)}
                                 onClick={this._toggleDropdown.bind(this)}>
                                <strong>Tags</strong>
                                <div>
                                    {this.state.currentTags.map((tag,i)=>
                                        <div key={"color-"+i} className={"tagColor "+tag["l.color"]} style={{backgroundColor:tag["l.bg_color"],color:tag["l.f_color"]}}>{tag["l.text"]}</div>
                                    )}
                                    <div className="clear"></div>
                                </div>

                                {
                                    this.state.dropdownIsVisible &&
                                    <div id="tagList" className="fade-animation" onMouseOver={this._handleFocus.bind(this)}
                                         onMouseLeave={this._handleBlur.bind(this)}>
                                        <div id="btn-manage-tag" onClick={this.openTags.bind(this)}>[Manage Tags]</div>
                                        {this.state.allTags.map((taga,ti)=>
                                            <div className={this.classTag(taga['ID(t)'])} key={"tag-all-"+ti+taga["ID(t)"]} onClick={this.clickTag.bind(this,taga["ID(t)"],taga["t.color"],taga["t.text"],taga["t.bg_color"],taga["t.f_color"])}>
                                                <div className={"tagColor "+taga['t.color']} style={{backgroundColor:taga['t.bg_color'],color:taga['t.f_color']}}>{taga["t.text"]}</div>
                                                <div className="clear"></div>
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>

                    </div>
                </div>
                <div id="popup" className="fade-animation">
                </div>
                {this.state.loading?<Loading loading={this.state.loading}/>:null}
                {this.state.showTag?<Tags projectId={this.state.projectId} socket={this.props.socket} closeTags={this.closeTags.bind(this)} />:null}
            </div>
        );
    }
}
class StatusAction extends Component {
    checkStatusActive() {
        if (this.props.status == "active") {
            return "block";
        } else {
            return "none";
        }
    }
    checkStatusInactive() {
        if (this.props.status != "active") {
            return "block";
        } else {
            return "none";
        }
    }
    render() {
        return (
            <div style={{width: '450px'}}>
                <div style={{display:this.checkStatusActive()}}>
                    <button type="button" className="btn green"  onClick={this.props.changeStatus.bind(this,'complete')}>Complete</button>
                    <button type="button" className="btn blue"  onClick={this.props.changeStatus.bind(this,'archive')}>Archive</button>
                    <button type="button" className="btn red"  onClick={this.props.changeStatus.bind(this,'trash')}>Trash</button>
                </div>
                <div style={{display:this.checkStatusInactive()}}>
                    <button type="button" className="btn orange"  onClick={this.props.changeStatus.bind(this,'active')}>Make Active</button>
                    <button type="button" className="btn blue"  onClick={this.props.changeStatus.bind(this,'archive')}>Archive</button>
                </div>
            </div>
        )
    }
}
export default TaskDetail;