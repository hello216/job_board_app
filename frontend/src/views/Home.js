import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import CSRFToken from './csrftoken';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default props => {
  const [users, setUsers] = useState([]);

  var csrftoken = Cookies.get('csrftoken');

  const submitHandler = (event) => {
    event.preventDefault();
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
      setUsers(response.data);
      console.log("user:");
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    })
  }

  console.log(users.length)

  return (
    <div>
      {
        (users
          ? users.map((user, idx) => {
            return (
              <div key={idx}>
                <h1>{user.username}</h1>
                <span>{user.created_at}</span>
              </div>
            )
          })
          : <h1>No data</h1>
        )
      }
      <form onSubmit={ submitHandler }>
        <CSRFToken />
        <button className="btn btn-primary" type="submit">get user</button>
      </form>
    </div>
  )
}
