import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import CSRFToken from './csrftoken';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default props => {
  const [user, setUser] = useState([]);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");

  var csrftoken = Cookies.get('csrftoken');

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

    axios.post('http://localhost:8000/api/logout')
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  }

  const submitHandler = (event) => {
    event.preventDefault();

    axios.post('http://localhost:8000/api/create_job', {
      title: title,
      company: company,
      url: url,
      location: location,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
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
            <td>
              <form onSubmit={ submitHandler }>
                <CSRFToken />

                <label htmlFor="title">Title:</label>
                <input type="text" name="title" onChange={(event) => { setTitle(event.target.value) }} />

                <label htmlFor="company">Company:</label>
                <input type="text" name="company" onChange={(event) => { setCompany(event.target.value) }} />

                <label htmlFor="url">URL:</label>
                <input type="text" name="url" onChange={(event) => { setUrl(event.target.value) }} />

                <label htmlFor="location">Location:</label>
                <input type="text" name="location" onChange={(event) => { setLocation(event.target.value) }} />

                <button className="btn btn-primary" type="submit">Create Job</button>
              </form>
            </td>
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
