import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default props => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [valErrors, setValErrors] = useState([]);

  const submitHandler = (event) => {
    event.preventDefault();

    let newErrors = [];

    axios.post('http://localhost:8000/api/log_user', {
      username: username,
      password: password,
    })
    .then(response => {
      console.log(response)
      if (response.status === 200) {
        // window.location.href = "/";
      }
    })
    .catch(error => {
      console.log(error)
      console.log(error.response.status)
      // if there is a validation error
      if (error.response.status === 400) {
        console.log(error.response.data.errors)
        let errors = error.response.data.errors

        // gets all error messages at append them to valErrors
        const errorkeys = Object.keys(errors);
        errorkeys.forEach((key, index) => {
          console.log(errors[key])
          newErrors.push(errors[key]);
        })
        setValErrors(newErrors);
      }
    })
  }

  return (
    <div id="login-form">
      <div id="validation-errors">
        {
          (valErrors
            ? valErrors.map((msg, idx) => {
              return (
                <div key={idx}>
                  <span id="val-msg">{ msg }</span>
                </div>
              )
            })
          : "NO DATA"
          )
        }
      </div>
      <form onSubmit={ submitHandler }>
        <label htmlFor="username">Username:</label>
        <input type="text" name="username" onChange={(event) => { setUsername(event.target.value) }} required/>

        <label htmlFor="password">Password:</label>
        <input type="password" name="password" onChange={(event) => { setPassword(event.target.value) }} required/>

        <button className="btn btn-primary" type="submit" id="login-btn">Login</button>
      </form>
    </div>
  )

}
