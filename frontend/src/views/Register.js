import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import cookie from "react-cookies";

export default props => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = (event) => {
    event.preventDefault();

    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = 'X-CSRFToken'

    axios.post('http://localhost:8000/api/create_user', {
      username: username,
      password: password
    })
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  }

  return (
    <div id="login-form">
      <form onSubmit={ submitHandler }>
        <label htmlFor="username">Username:</label>
        <input type="text" name="username" onChange={(event) => { setUsername(event.target.value) }} required/>

        <label htmlFor="password">Password:</label>
        <input type="password" name="password" onChange={(event) => { setPassword(event.target.value) }} required/>

        <input
         type="hidden"
         value={cookie.load("csrftoken")}
         name="csrfmiddlewaretoken"
        />

        <button className="btn btn-primary" type="submit" id="login-btn">register</button>
      </form>
    </div>
  )

}
