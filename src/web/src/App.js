
import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";

import Authentication from './pages/authentication/Authentication';
import Home from './pages/home/Home';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router >
          <Route path="/" exact component={Authentication} />
          <Route path="/home/" component={Home} />
      </Router>
    );
  }
}

export default App;
