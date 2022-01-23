import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import CSRFToken from './csrftoken';
import { useParams } from 'react-router-dom';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default props => {
  const [job, setJob] = useState("");
  const [valErrors, setValErrors] = useState([]);
  const [title, setTitle] = useState(job.title);
  const [company, setCompany] = useState(job.company);
  const [url, setUrl] = useState(job.url);
  const [location, setLocation] = useState(job.location);

  const { jobId } = useParams();

  var csrftoken = Cookies.get('csrftoken');

  useEffect(() => {
    let newErrors = [];
    axios.get('http://localhost:8000/api/get_jobs')
    .then(response => {
      console.log(response);

      // get the job from the array that needs to be edited
      const jobs = response.data.jobs;
      console.log(jobs)
      for (let i=0; i < jobs.length; i++) {
        console.log(jobs[i].job_id);
        console.log(jobId)
        console.log(jobs[i].job_id === jobId)
        if (jobs[i].job_id === parseInt(jobId)) {
          setJob(jobs[i])
        }
      }
    })
    .catch(error => {
      console.log(error);
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
  }, []);

  const editJob = (event) => {
    event.preventDefault();

    axios.put(`http://localhost:8000/api/edit_job`, {
      data: {'job_id': jobId, 'title': title, 'company': company, 'url': url, 'location': location},
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
    .then(response => {
      console.log(response);
      window.location.href = '/apps';
    })
    .catch(error => {
      console.log(error);
    })
  }

  return (
    <div>
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
      <form onSubmit={ editJob }>
        <CSRFToken />
        <label htmlFor="title">Title:</label>
        <input type="text" name="title" placeholder={ job.title } onChange={(event) => { setTitle(event.target.value) }} />

        <label htmlFor="company">Company:</label>
        <input type="text" name="company" placeholder={ job.company } onChange={(event) => { setCompany(event.target.value) }} />

        <label htmlFor="url">URL:</label>
        <input type="text" name="url" placeholder={ job.url } onChange={(event) => { setUrl(event.target.value) }} />

        <label htmlFor="location">Location:</label>
        <input type="text" name="location" placeholder={ job.location } onChange={(event) => { setLocation(event.target.value) }} />

        <button className="btn btn-primary" type="submit">Edit</button>
      </form>
    </div>
  )

}
