import React from 'react';
import axios from 'axios';

export default () => {

  const redirectLogin = () => {
    console.log("redirecting to login");
    window.location.href = '/login';
  }

  const logout = () => {
    axios.get('http://localhost:8000/api/logout')
    .then(response => {
      console.log("user logout");
      navigate('/')
    })
    .catch(error => {
      console.log("Logout failed")
      console.log(error.response)
    })
  }

  return (
    <nav className="active">
      <ul id="nav">
        <li>
          <button className="btn btn-light" onClick={ redirectLogin }>Home</button>
        </li>
        <li>
          <button className="btn btn-light" onClick={ logout }>Logout</button>
        </li>
      </ul>
    </nav>
  )

}
