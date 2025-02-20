import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/Application.css';

const Application = () => {
  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const jobId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${jobId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setJob(data);
          setFiles(data.files || []);
        } else if (response.status === 404) {
          setError('Job application not found.');
        } else if (response.status === 401 || response.status === 403) {
          setError('Access denied or unauthorized.');
        } else if (response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to retrieve job application details.');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('An unexpected error occurred while fetching job details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleViewFile = async (fileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('File not found.');
        } else {
          console.error('Failed to download file:', response.status);
          setError('Failed to download file.');
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank'); // Opens in a new tab

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100); // Revoke object URL after opening to free up memory
    } catch (error) {
      console.error('Failed to open file:', error);
      setError('An unexpected error occurred while opening the file.');
    }
  };

  const handleDownloadFile = async (fileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('File not found.');
        } else {
          console.error('Failed to download file:', response.status);
          setError('Failed to download file.');
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'file.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      setError('An unexpected error occurred while downloading the file.');
    }
  };

  if (isLoading) {
    return (
      <div className="application-container">
        <div className="nav-container">
          <Navbar />
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="application-container">
        <div className="nav-container">
          <Navbar />
        </div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="application-container">
        <div className="nav-container">
          <Navbar />
        </div>
        <p>Job application not found.</p>
      </div>
    );
  }

  return (
    <div className="application-container">
      <div className="nav-container">
        <Navbar />
      </div>

      <div className="application-details">
        <h2>Job Application Details</h2>
        <div className="job-info">
          <p><strong>Title:</strong> {job.title}</p>
          <p><strong>Company:</strong> {job.company}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>URL:</strong> <a href={job.url} target="_blank" className="custom-link">{new URL(job.url).host}</a></p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Submitted At:</strong> {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).format(new Date(job.createdAt))}</p>
        </div>

        <h3>Linked Files</h3>
        {files.length === 0 ? (
          <p>No files are linked to this job application.</p>
        ) : (
          <ul className="files-list">
            {files.map(file => (
              <li key={file.id} className="file-item">
                <div className="file-actions">
                  <button className="custom-button" onClick={() => handleViewFile(file.id)}>View</button>
                  <button className="custom-button" onClick={() => handleDownloadFile(file.id)}>Download</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Application;