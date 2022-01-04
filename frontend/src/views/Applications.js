import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cookie from "react-cookies";

export default props => {
  const [user, setUser] = useState([]);

  useEffect(() => {

    axios.get('http://localhost:8000/api/get_user')
    .then(response => {
      setUser(response.data);
      console.log("user:");
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    })

  }, []);

  const logoutHandler = (event) => {
    event.preventDefault();

    axios.get('http://localhost:8000/api/logout')
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Position</th>
            <th>Company</th>
            <th>Job URL</th>
            <th>Location</th>
            <th>Date Submitted</th>
            <th>Actions</th>
            <button onClick={ logoutHandler }>logout</button>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )

}
