import React, { Component } from 'react';

import ChatHttpServer from '../../../api/ChatHttpServer';
import ChatSocketServer from '../../../socketio/ChatSocketServer';

import './Conversation.css';
import { Button } from 'react-bootstrap';
import * as io from 'socket.io-client';
import config from '../../../config'



class Conversation extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      messageLoading: true,
      conversations: [],
      selectedUser: null
    }
    this.messageContainer = React.createRef();
    this.setSeen = this.setSeen.bind(this);
    this.socket = null;
  }

  setSeen() {
    if(this.state.conversations[0] !== undefined){
      
      var conversations=this.state.conversations;
      conversations[ conversations.length -1].isSeen=true;

      this.setState({
        conversations: conversations,
    
      });
    }
  }


  componentDidMount() {
    ChatSocketServer.receiveMessage();
    ChatSocketServer.receiveSeen(this.setSeen);

   ChatSocketServer.eventEmitter.on('add-message-response', this.receiveSocketMessages);
  }

  componentWillUnmount() {
    ChatSocketServer.eventEmitter.removeListener('add-message-response', this.receiveSocketMessages);
    
  }

  componentDidUpdate(prevProps) {
    if (prevProps.newSelectedUser === null || (this.props.newSelectedUser.id !== prevProps.newSelectedUser.id)) {
      this.getMessages();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (state.selectedUser === null || state.selectedUser.id !== props.newSelectedUser.id) {
      return {
        selectedUser: props.newSelectedUser
      };
    }
    return null;    
  }

  receiveSocketMessages = (socketResponse) => {
    const { selectedUser } = this.state;
      if (selectedUser !== null && selectedUser.id === socketResponse.fromUserId) {
        this.setState({
          conversations: [...this.state.conversations, socketResponse]
        });
        this.scrollMessageContainer();
      }
  }

  getMessages = async () => {
    try {
      const { userId, newSelectedUser} = this.props;
      const messageResponse = await ChatHttpServer.getMessages(userId,newSelectedUser.id);
      if (!messageResponse.error) {
        this.setState({
          conversations: messageResponse.messages,
        });
        this.scrollMessageContainer();
      } else {
        alert('Unable to fetch messages');
      }
      this.setState({
        messageLoading: false
      });
    } catch (error) {
      this.setState({
        messageLoading: false
      });
    }
  }

  sendMessage = (event) => {
    if (event.key === 'Enter'||onclick) {
      const message = event.target.value;
      const { userId, newSelectedUser } = this.props;
      if (message === '' || message === undefined || message === null) {
        alert(`Message can't be empty.`);
      } else if (userId === '') {
        this.router.navigate(['/']);
      } else if (newSelectedUser === undefined) {
        alert(`Select a user to chat.`);
      } else {
        this.sendAndUpdateMessages({
          fromUserId: userId,
          message: (message).trim(),
          toUserId: newSelectedUser.id,
          isSeen: false,
          message_list_name: userId + newSelectedUser.id,
        });
        event.target.value = '';
      }
    }
  }

  sendAndUpdateMessages(message) {
    try {
      ChatSocketServer.sendMessage(message);
      this.setState({
        conversations : [...this.state.conversations, message]
      });
      this.scrollMessageContainer();
    } catch (error) {
      alert(`Can't send your message`);
    }
  }

  scrollMessageContainer() {
    if (this.messageContainer.current !== null) {
      try {
        setTimeout(() => {
          this.messageContainer.current.scrollTop = this.messageContainer.current.scrollHeight;
        }, 100);
      } catch (error) {
        console.warn(error);
      }
    }
  }

  alignMessages(toUserId) {
    const { userId } = this.props;
    return userId !== toUserId;
  }

  showIsSeen(){
    var indexLastRecord = this.state.conversations[this.state.conversations.length -1];
    this.scrollMessageContainer();
    if(indexLastRecord.isSeen === true && indexLastRecord.fromUserId === sessionStorage.getItem('userid'))
    {
      console.log("true")
      return true
    }
    console.log("fasle")
    return false
  }
  
  getMessageUI () {
    return (
      <ul ref={this.messageContainer} className="message-thread">
        {
          this.state.conversations.map( (conversation, index) => 
            <li className={`${this.alignMessages(conversation.toUserId) ? 'align-right' : ''}`} key={index}>
             {conversation.message}
             </li>
          )
        }
        {
          <li className={`${this.showIsSeen() ? "show-seen" : "hide-seen"}`}>seen</li>
        }
      </ul>
      
    )
  }

  getInitiateConversationUI() {
    if (this.props.newSelectedUser !== null) {
      return (
        <div className="message-thread start-chatting-banner">
          <p className="heading">
            First time chat with {this.props.newSelectedUser.username},
            <span className="sub-heading"> Say Hi.</span>
          </p>			
        </div>
      )
    }    
  }



  onFocusMessage = () => {

    var arr = this.state.conversations;
    var lastMessage = arr[arr.length - 1];
 
    if(lastMessage){
      var data = {
        fromUserId: lastMessage.fromUserId,
        toUserId: lastMessage.toUserId
      }

      if(sessionStorage.getItem('userid') !== lastMessage.fromUserId){
        ChatSocketServer.sendSeen(data);
      }
    }
  }

  render() {
    const { messageLoading, selectedUser } = this.state;
    return (
      <>
        <div className={`message-overlay ${!messageLoading ? 'visibility-hidden' : ''}`}>
          <h3 style={{color:'#1DA57A'}}> {selectedUser !== null && selectedUser.username ? 'Loading Messages' : '' }</h3>
        </div>
        <div className={`message-wrapper ${messageLoading ? 'visibility-hidden' : ''}`}>
          <div className="message-container">
            <div className="opposite-user">
              {this.props.newSelectedUser !== null ? this.props.newSelectedUser.username : '----'}
            </div>
            {this.state.conversations.length > 0 ? this.getMessageUI() : this.getInitiateConversationUI()}
          </div>

          <div className="message-typer">
            <form>
              <textarea 
              className="message form-control" 
              placeholder="Type and hit Enter" 
              onKeyPress={this.sendMessage}
              onFocus={this.onFocusMessage}>
              </textarea>
  
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default Conversation;
