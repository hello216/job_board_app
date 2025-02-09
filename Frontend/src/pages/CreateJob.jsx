import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateJob = () => {
  const [job, setJob] = useState({
    status: '',
    title: '',
    company: '',
    url: '',
    location: '',
  });

  const [statuses, setStatuses] = useState([]);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/getstatuses`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Fetched statuses:', data);
          setStatuses(data);
        } else {
          setErrors({ general: 'Failed to fetch job statuses.' });
        }
      } catch (error) {
        console.log(error);
        setErrors({ general: 'An unexpected error occurred while fetching job statuses.' });
      }
    };

    fetchStatuses();
  }, []);

  useEffect(() => {
    console.log('Updated statuses state:', statuses);
  }, [statuses]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      status: job.status,
      title: job.title,
      company: job.company,
      url: job.url,
      location: job.location,
      note: '',
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.log(response.status);
        console.log(response.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prevJob) => ({ ...prevJob, [name]: value }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Status:</label>
          <select name="status" value={job.status} onChange={handleChange}>
            <option value="">Select</option>
            {statuses.length > 0 &&
              statuses.map(status => (
                <option key={status.id} value={status.value}>{status.name}</option>
              ))}
          </select>
        </div>

        <div>
          <label>Title:</label>
          <input type="text" name="title" value={job.title} onChange={handleChange} />
        </div>

        <div>
          <label>Company:</label>
          <input type="text" name="company" value={job.company} onChange={handleChange} />
        </div>

        <div>
          <label>Url:</label>
          <input type="text" name="url" value={job.url} onChange={handleChange} />
        </div>

        <div>
          <label>Location:</label>
          <input type="text" name="location" value={job.location} onChange={handleChange} />
        </div>

        <div>
          <input type="submit" value="Submit" />
        </div>
      </form>

      <div>
        <Link to="/">Go Home</Link>
      </div>
    </>
  );
};

export default CreateJob;