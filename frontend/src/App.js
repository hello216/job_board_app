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
  const [user, setUser] = useState([]);

  var csrftoken = Cookies.get('csrftoken');

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
      setUser(response.data);
      if (response.status === 200) {
        setIsAuthenticated(true);
        console.log("userAuthenticated")
      }
    })
    .catch(error => {
      console.log(error);
    })
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} isAuthenticated={isAuthenticated} />
          <Route path="/Apps" element={<Applications />} />
          <Route path='/editJob/:jobId' element={<EditJob/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
