import React, { Component } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';

import ChatHttpServer from '../../../api/ChatHttpServer';
import './Registration.css';

class Registration extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      usernameAvailable: true
    };
  }

  handleRegistration = async (event) => {
    event.preventDefault();
    this.props.loadingState(true);
    try {
      var data = {
        username: this.state.username, 
        password: this.state.password
      }
      const response = await ChatHttpServer.register(data);
      this.props.loadingState(false);
      if (response.error) {
        alert(response.message)
      } else {
        ChatHttpServer.setLS('userid', response.userId);
        this.props.history.push(`/home`);
        alert('Registration Successful !')
      }
    } catch (error) {
      this.props.loadingState(false);
      alert('Unable to register, try after some time' + error)
    }
  }
  render() {
    return (
      <Form className="auth-form">
        <Form.Group controlId="formUsername">
          <DebounceInput
            className="form-control"
            placeholder = "Enter username"
            minLength={2}
            debounceTimeout={300}
            onChange= {(e) => this.setState({username: e.target.value})}
            />
          <Alert className={{
            'username-availability-warning' : true,
            'visibility-hidden': this.state.usernameAvailable
          }}  variant="danger">
            <strong>{this.state.username}</strong> is already taken, try another username.
          </Alert>
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Control 
            type = "password"
            name = "password"
            placeholder = "Password"
            onChange= {(e) => this.setState({password: e.target.value})}
          />
        </Form.Group>
        <Button className="btnRegis" type="submit" onClick={this.handleRegistration}>
          Registration
        </Button>
      </Form>
    );
  }
}

export default withRouter(Registration)
