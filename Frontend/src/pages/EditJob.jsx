import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ValidateSanitize from '../services/validateSanitizeService';
import '../css/EditJob.css';

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
          } else if (response.status === 429) {
            setErrors({ general: 'Too many requests. Please try again later.' });
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
        } else if (response.status === 429) {
          setErrors({ general: 'Too many requests. Please try again later.' });
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
    setErrors({});

    const validationErrors = {};
    const titleSanitized = ValidateSanitize.sanitizeAndValidateString(job.title);
    if (titleSanitized.error) validationErrors.title = titleSanitized.error;

    const companySanitized = ValidateSanitize.sanitizeAndValidateString(job.company);
    if (companySanitized.error) validationErrors.company = companySanitized.error;

    const urlResult = ValidateSanitize.sanitizeAndValidateUrl(job.url);
    if (urlResult.error) validationErrors.url = urlResult.error;

    const locationSanitized = ValidateSanitize.sanitizeAndValidateString(job.location);
    if (locationSanitized.error) validationErrors.location = locationSanitized.error;

    const statusResult = ValidateSanitize.sanitizeAndValidateStatus(job.status);
    if (statusResult.error) validationErrors.status = statusResult.error;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const body = {
      status: statusResult.sanitized,
      title: titleSanitized.sanitized,
      company: companySanitized.sanitized,
      url: urlResult.sanitized,
      location: locationSanitized.sanitized,
      note: ValidateSanitize.sanitizeAndValidateNotes(job.note || '').sanitized || '',
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
        return;
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      let data = isJson ? await response.json() : null;

      if (response.status === 429) {
        setErrors({ general: 'Too many requests. Please try again later.' });
      } else if (data?.errors) {
        const extractedErrors = {};
        for (const [field, messages] of Object.entries(data.errors)) {
          extractedErrors[field] = messages.join(', ');
        }
        setErrors(extractedErrors);
      } else {
        setErrors({ general: data?.title || 'Failed to update the job.' });
      }
    } catch (error) {
      console.error(error);
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

        <div className="inputs">
          <label className="form-label">Note:</label>
          <textarea className="form-control" name="note" value={job.note} onChange={handleChange} />
        </div>

        <button type="submit" className="custom-button">Update</button>
      </form>

      <div className="go-home-link">
        <a href="/">Go Home</a>
      </div>
    </div>
  );
};

export default EditJob;