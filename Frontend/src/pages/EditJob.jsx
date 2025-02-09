import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const EditJob = () => {
  const [job, setJob] = useState({
    status: '',
    title: '',
    company: '',
    url: '',
    location: '',
    note: '',
  });

  const [statuses, setStatuses] = useState([]);
  const [errors, setErrors] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobAndStatuses = async () => {
      try {
        // Fetch job
        const responseJob = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!responseJob.ok) {
          if (responseJob.status === 404) {
            setErrors({ general: 'Job not found.' });
          } else if (responseJob.status === 401 || responseJob.status === 403) {
            navigate('/login');
          } else {
            setErrors({ general: 'Failed to fetch job details.' });
          }
          return;
        }
        const jobData = await responseJob.json();
        setJob({
          status: jobData.status,
          title: jobData.title,
          company: jobData.company,
          url: jobData.url,
          location: jobData.location,
          note: jobData.note,
        });

        // Fetch statuses
        const responseStatuses = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/getstatuses`, {
          method: 'GET',
          credentials: 'include',
        });

        if (responseStatuses.ok) {
          const statusesData = await responseStatuses.json();
          setStatuses(statusesData);
        } else {
          setErrors({ general: 'Failed to fetch job statuses.' });
        }
      } catch (error) {
        console.log(error);
        setErrors({ general: 'An unexpected error occurred while fetching job details or statuses.' });
      }
    };

    fetchJobAndStatuses();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      status: job.status,
      title: job.title,
      company: job.company,
      url: job.url,
      location: job.location,
      note: job.note,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
      } else {
        try {
          const errorData = await response.json();
          if (errorData && errorData.errors) {
            setErrors(errorData.errors);
          } else {
            setErrors({ general: 'Failed to update the job.' });
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          setErrors({ general: 'Failed to parse error response.' });
        }
      }
    } catch (error) {
      console.log(error);
      setErrors({ general: 'An unexpected error occurred.' });
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
          <label>Note:</label>
          <textarea name="note" value={job.note} onChange={handleChange} />
        </div>

        <div>
          <input type="submit" value="Update" />
        </div>

        {Object.keys(errors).length > 0 && (
          <div style={{ color: 'red' }}>
            {Object.keys(errors).map((key) => (
              Array.isArray(errors[key]) ? (
                errors[key].map((error, index) => (
                  <p key={`${key}-${index}`}>{key}: {error}</p>
                ))
              ) : (
                <p key={key}>{key}: {errors[key]}</p>
              )
            ))}
          </div>
        )}
      </form>

      <div>
        <Link to="/">Go Home</Link>
      </div>
    </>
  );
};

export default EditJob;