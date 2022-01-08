import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import CSRFToken from './csrftoken';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default props => {
  const [jobs, setJobs] = useState();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [valErrors, setValErrors] = useState([]);
  const [jobId, setJobId] = useState("");

  var csrftoken = Cookies.get('csrftoken');

  useEffect(() => {

    axios.get('http://localhost:8000/api/get_jobs')
    .then(response => {
      console.log(response);
      setJobs(response.data.jobs);
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

    let newErrors = [];

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
      console.log(error.response.status)
      // if there is a validation error
      if (error.response.status === 400) {
        console.log(error.response.data.errors)
        let errors = error.response.data.errors

        // gets all error messages at append them to valErrors
        const errorkeys = Object.keys(errors);
        errorkeys.forEach((key, index) => {
          newErrors.push(errors[key]);
        })
        setValErrors(newErrors);
      }
    })
  }

  const editJob = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:8000/api/edit_job`, {
      data: {"job_id": jobId}
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    })
  }

  const deleteJob = (event) => {
    event.preventDefault();
    axios.delete(`http://localhost:8000/api/delete_job`, {
      data: {"job_id": jobId}
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
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
          {
            (jobs
              ? jobs.map((job, idx) => {
                return (
                  <tr key={ idx }>
                    <td>{ job.status }</td>
                    <td>{ job.title }</td>
                    <td>{ job.company }</td>
                    <td>{ job.url }</td>
                    <td>{ job.location }</td>
                    <td>{ job.date_submitted }</td>
                    <td>
                      <form onSubmit={ editJob }>
                        <CSRFToken />
                        <button className="btn btn-primary" type="submit" onClick={(event) => { setJobId(job.job_id) }}>Edit</button>
                      </form>
                      <form onSubmit={ deleteJob }>
                        <CSRFToken />
                        <button className="btn btn-primary" type="submit" onClick={(event) => { setJobId(job.job_id) }}>Delete</button>
                      </form>
                    </td>
                  </tr>
                )
              })
              : "NO DATA"
            )
          }
        </tbody>
      </table>
      <div id="validation-errors">
        {
          (valErrors
            ? valErrors.map((msg, idx) => {
              return (
                <div key={ idx }>
                  <span id="val-msg">{ msg }</span>
                </div>
              )
            })
          : "NO DATA"
          )
        }
      </div>
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
    </div>
  )

}
