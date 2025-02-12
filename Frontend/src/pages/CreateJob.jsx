import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ValidateSanitize from '../services/validateSanitizeService';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const titleSanitized = ValidateSanitize.sanitizeAndValidateString(job.title);
    const companySanitized = ValidateSanitize.sanitizeAndValidateString(job.company);
    const urlResult = ValidateSanitize.sanitizeAndValidateUrl(job.url);
    const locationSanitized = ValidateSanitize.sanitizeAndValidateString(job.location);
    const statusResult = ValidateSanitize.sanitizeAndValidateStatus(job.status);

    if (titleSanitized.error) {
      setErrors(prev => ({ ...prev, title: titleSanitized.error }));
    }
    if (companySanitized.error) {
      setErrors(prev => ({ ...prev, company: companySanitized.error }));
    }
    if (urlResult.error) {
      setErrors(prev => ({ ...prev, url: urlResult.error }));
    }
    if (locationSanitized.error) {
      setErrors(prev => ({ ...prev, location: locationSanitized.error }));
    }
    if (statusResult.error) {
      setErrors(prev => ({ ...prev, status: statusResult.error }));
    }

    if (Object.keys(errors).length > 0) {
      return;
    }

    const body = {
      status: statusResult.sanitized,
      title: titleSanitized.sanitized,
      company: companySanitized.sanitized,
      url: urlResult.sanitized,
      location: locationSanitized.sanitized,
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

      const isJson = response.headers.get('content-type')?.includes('application/json');
      let data;

      if (response.ok) {
        navigate('/');
        return;
      }

      if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
        setErrors({ general: data });
        return;
      }

      if (data.errors) {
        setErrors(data.errors);
      } else if (data && data.title) {
        // Specific handling for title, company, url, location
        setErrors(prev => ({ ...prev, general: data.title })); // set title error
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
    <div className="container my-5">
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger mt-3">
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

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Status:</label>
          <select className="form-select" name="status" value={job.status} onChange={handleChange}>
            <option value="">Select</option>
            {statuses.length > 0 &&
              statuses.map(status => (
                <option key={status.id} value={status.value}>{status.name}</option>
              ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Title:</label>
          <input className="form-control" type="text" name="title" value={job.title} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Company:</label>
          <input className="form-control" type="text" name="company" value={job.company} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">URL:</label>
          <input className="form-control" type="text" name="url" value={job.url} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Location:</label>
          <input className="form-control" type="text" name="location" value={job.location} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-dark">Add</button>
      </form>

      <div className="mt-4">
        <Link to="/" className="link-dark link-opacity-50-hover">Go Home</Link>
      </div>
    </div>
  );
};

export default CreateJob;