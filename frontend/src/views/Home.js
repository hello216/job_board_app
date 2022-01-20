import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import CSRFToken from './csrftoken';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default props => {
  const [user, setUser] = useState([]);
  const { isAuthenticated } = props;

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
      console.log("the response:")
      console.log(response);
      setUser(response.data);
    })
    .catch(error => {
      console.log(error);
      window.location.href = '/login';
    })
  }, []);

  return (
    <div>
      <h2>User:</h2>
      <h3>{ user.username }</h3>
    </div>
  )
}
