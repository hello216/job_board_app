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
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStatuses();
    fetchUserFiles();
  }, []);

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

  const fetchUserFiles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/all`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Access denied or unauthorized.');
        } else if (response.status === 404) {
          setErrors({ general: 'No files found.' });
        } else {
          console.error('Failed to fetch files:', response.status);
          setErrors({ general: 'Failed to fetch files.' });
        }
        return;
      }

      const filesData = await response.json();
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch user files:', error);
      setErrors({ general: 'An unexpected error occurred while fetching files.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    const titleSanitized = ValidateSanitize.sanitizeAndValidateString(job.title);
    const companySanitized = ValidateSanitize.sanitizeAndValidateString(job.company);
    const urlResult = ValidateSanitize.sanitizeAndValidateUrl(job.url);
    const locationSanitized = ValidateSanitize.sanitizeAndValidateString(job.location);
    const statusResult = ValidateSanitize.sanitizeAndValidateStatus(job.status);

    if (titleSanitized.error) {
      newErrors.title = titleSanitized.error;
    }
    if (companySanitized.error) {
      newErrors.company = companySanitized.error;
    }
    if (urlResult.error) {
      newErrors.url = urlResult.error;
    }
    if (locationSanitized.error) {
      newErrors.location = locationSanitized.error;
    }
    if (statusResult.error) {
      newErrors.status = statusResult.error;
    }

    // If there are errors, update state and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        data = await response.json();
        const createdJobId = data.jobId;
        setJobId(createdJobId);

        // Link the file to the job (only if a file is selected)
        if (selectedFileId) {
          await handleLinkFileToJob(createdJobId);
        }

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
            extractedErrors[field.toLowerCase()] = messages.join(', ');
          }
          setErrors(extractedErrors);
        } else {
          setErrors({ general: data.title || 'Failed to create the job.' });
        }
      } else {
        setErrors({ general: 'Invalid Inputs.' });
      }
    } catch (error) {
      console.log(error);
      setErrors({ general: 'An unexpected error occurred.' });
    }
  };

  const handleLinkFileToJob = async (createdJobId) => {
    if (!selectedFileId) {
      console.log(selectedFileId);
      console.log(createdJobId);
      setErrors({ general: 'Please select a file to link.' });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/link/${selectedFileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: createdJobId }),
        credentials: 'include',
      });

      if (!response.ok) {
        setErrors({ general: 'Failed to link file to job application.' });
        return;
      }

      setErrors({});
      setShowLinkModal(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to link file:', error);
      setErrors({ general: 'An unexpected error occurred while linking the file.' });
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

      {showLinkModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Link a File to This Job</h3>
            <select value={selectedFileId || ''} onChange={(e) => setSelectedFileId(e.target.value)}>
              <option value="">Select a File</option>
              {files.map(file => (
                <option key={file.id} value={file.id}>{file.name} - {file.fileType}</option>
              ))}
            </select>
            <button className="custom-button" onClick={() => setShowLinkModal(false)}>Confirm File Selection</button>
            <button className="custom-button-danger" onClick={() => setShowLinkModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div>
        <a href="/">Go Home</a>
      </div>
    </div>
  );
};

export default CreateJob;