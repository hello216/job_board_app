import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ValidateSanitize from '../services/validateSanitizeService';
import '../css/EditJob.css';

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
        } else if (response.status === 429) {
          setErrors({ general: 'Too many requests. Please try again later.' });
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
      } else if (response.status === 429) {
        setErrors({ general: 'Too many requests. Please try again later.' });
      }

      if (isJson) {
        data = await response.json();
        if (data.errors) {
          const extractedErrors = {};
          for (const [field, messages] of Object.entries(data.errors)) {
            extractedErrors[field] = messages.join(', ');
            // Convert 'Url' to 'url'
            extractedErrors['url'] = extractedErrors['Url'];
            delete extractedErrors['Url'];
          }
          setErrors(extractedErrors);
        } else {
          setErrors({ general: data.title || 'Failed to create the job.' });
        }
      } else {
        // Directly set a generic error message if response is not JSON
        setErrors({ general: 'Invalid URL.' });
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
    <div className="container">
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger">
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

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <label className="form-label">Status:</label>
          <select className="form-select" name="status" value={job.status} onChange={handleChange}>
            <option value="">Select</option>
            {statuses.length > 0 &&
              statuses.map(status => (
                <option key={status.id} value={status.value}>{status.name}</option>
              ))}
          </select>
          {errors.status && <div className="error-message">{errors.status}</div>}
        </div>

        <div className="inputs">
          <label className="form-label">Title:</label>
          <input className="form-control" type="text" name="title" value={job.title} onChange={handleChange} />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="inputs">
          <label className="form-label">Company:</label>
          <input className="form-control" type="text" name="company" value={job.company} onChange={handleChange} />
          {errors.company && <div className="error-message">{errors.company}</div>}
        </div>

        <div className="inputs">
          <label className="form-label">URL:</label>
          <input className="form-control" type="text" name="url" value={job.url} onChange={handleChange} />
          {errors.url && <div className="error-message">{errors.url}</div>}
        </div>

        <div className="inputs">
          <label className="form-label">Location:</label>
          <input className="form-control" type="text" name="location" value={job.location} onChange={handleChange} />
          {errors.location && <div className="error-message">{errors.location}</div>}
        </div>

        <button type="submit" className="custom-button">Add</button>
      </form>

      <div>
        <a href="/">Go Home</a>
      </div>
    </div>
  );
};

export default CreateJob;