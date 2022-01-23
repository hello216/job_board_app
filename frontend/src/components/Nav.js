import React from 'react';
import axios from 'axios';

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
          <button className="btn btn-light" onClick={ redirectLogin }>Home</button>
        </li>
        <li>
          <button className="btn btn-light" onClick={ logoutHandler }>Logout</button>
        </li>
      </ul>
    </nav>
  )

}
