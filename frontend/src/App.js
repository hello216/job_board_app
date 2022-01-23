import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Applications from './views/Applications';
import EditJob from './views/EditJob';
import Cookies from 'js-cookie';
import CSRFToken from './views/csrftoken';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  var csrftoken = Cookies.get('csrftoken');

  console.log("in App.js")

  useEffect(() => {
    axios.get('http://localhost:8000/api/get_user', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
    .then(response => {
      console.log(response);
      if (response.status === 200) {
        setIsAuthenticated(true);
        console.log("userAuthenticated")
      }
    })
    .catch(error => {
      console.log(error);
      // Redirect user to '/login' to get authenticated
      let url = window.location.pathname;
      console.log(url);
      if (url !== '/login' && url !== '/register') {
        console.log("user is not in login page")
        window.location.href = '/login';
      }
    })
  }, []);

  // <Route path="/home" element={<Home />} />


  if (isAuthenticated) {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Apps" element={<Applications />} />
            <Route path='/editJob/:jobId' element={<EditJob/>} />
          </Routes>
        </BrowserRouter>
      </div>
    )
  } else {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
    )
  }

}

export default App;
