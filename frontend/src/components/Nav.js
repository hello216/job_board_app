import React from 'react';
import axios from 'axios';
import '../stylesheets/navStyling.css';

export default () => {

  const redirectLogin = () => {
    console.log("redirecting to login");
    window.location.href = '/login';
  }

  const logoutHandler = (event) => {
    event.preventDefault();

    axios.post('http://localhost:8000/api/logout')
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  }

  return (
    <nav className="active">
      <ul id="nav">
        <li>
          <button className="btn btn-primary" onClick={ redirectLogin }>Home</button>
        </li>
        <li>
          <button className="btn btn-danger" onClick={ logoutHandler }>Logout</button>
        </li>
      </ul>
    </nav>
  )

}
