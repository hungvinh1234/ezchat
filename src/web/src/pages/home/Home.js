import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

import ChatSocketServer from '../../socketio/ChatSocketServer';
import ChatHttpServer from '../../api/ChatHttpServer';

import ChatList from './chat-list/ChatList';
import Conversation from './conversation/Conversation';
import loadinggif from '../../images/loading3.gif'

import './Home.css';
import { Row,Col, Button } from 'react-bootstrap';
import logouticon from '../../images/logout.png'
import logo from '../../images/logo.png'

class Home extends Component {
  userId = null;
  state = {
    isOverlayVisible: true,
    username: '______',
    selectedUser: null
  }

  logout = async () => {
    try {
      await ChatHttpServer.removeLS();
      ChatSocketServer.logout({
        userId: this.userId
      });
      ChatSocketServer.eventEmitter.on('logout-response', (loggedOut) => {
        this.props.history.push(`/`);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  setRenderLoadingState = (loadingState) => {
    this.setState({
      isOverlayVisible: loadingState
    });
  }

  async componentDidMount() {
    try {
      this.setRenderLoadingState(true);
      this.userId = await ChatHttpServer.getUserId();
      const response = await ChatHttpServer.userSessionCheck(this.userId);
      if (response.error) {
        this.props.history.push(`/`)
      } else {
        this.setState({
          username: response.username
        });
        ChatHttpServer.setLS('username', response.username);
        ChatSocketServer.establishSocketConnection(this.userId);
      }
      this.setRenderLoadingState(false);
    } catch (error) {
      this.setRenderLoadingState(false);
      this.props.history.push(`/`)
    }
  }

  updateSelectedUser = (user) => {
    this.setState({
      selectedUser: user
    });
  }

  getChatListComponent() {
    return this.state.isOverlayVisible ? null : <ChatList userId={this.userId} updateSelectedUser={this.updateSelectedUser}/>
  }

  getChatBoxComponent = () => {
    return this.state.isOverlayVisible ? null : <Conversation userId={this.userId} newSelectedUser={this.state.selectedUser}/>
  }
  

  render() {
    return (
      <div className="App">
        <div className = {`${this.state.isOverlayVisible ? 'overlay': 'visibility-hidden' } `}>
          <img alt="" src={loadinggif}/>
        </div>
        <header className="app-header">
          <nav className="navbar navbar-expand-md">
            <img alt="" className="logoicon" src={logo}/>
            <h2 style={{color:'black',paddingLeft:'20px',paddingTop:'10px'}}>{this.state.username} </h2>
          </nav>
          <ul className="nav justify-content-end">
            <li className="nav-item">
              <Button className="logoutbtn" onClick={this.logout}>
              <img alt="" className="logouticon" src={logouticon} />
              </Button>
            </li>
          </ul>
        </header>

        <main role="main" className="containerchat content" >
        
          <div className="row chat-content">
            <div className="col-3 chat-list-container">
              {this.getChatListComponent()}
            </div>
            <div className="col-9 message-container">
              {this.getChatBoxComponent()}
            </div>
          </div>
         
        </main>
      </div>
    );
  }
}

export default withRouter(Home)
