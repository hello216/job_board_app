import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/Application.css';
import JSZip from 'jszip';

const Application = () => {
  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const jobId = window.location.pathname.split('/').pop();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
      fetchJobDetails();
    }, [jobId]);

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

  const handleViewFile = async (fileId) => {
      try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/${fileId}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                  'Accept': 'application/zip',
              },
          });

          if (!response.ok) {
              if (response.status === 404) {
                  setError('File not found.');
              } else {
                  console.error('Failed to fetch file:', response.status);
                  setError('Failed to fetch file.');
              }
              return;
          }

          const zipBlob = await response.blob();
          const zip = await JSZip.loadAsync(zipBlob); // Unzip
          const pdfFileName = Object.keys(zip.files)[0]; // Get the PDF name
          const pdfArrayBuffer = await zip.file(pdfFileName).async('arraybuffer'); // Get PDF as ArrayBuffer

          // Create a Blob with explicit application/pdf MIME type
          const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);

          if (isMobile) {
              // Mobile version: Use an iframe in a modal
              const container = document.createElement('div');
              container.style.position = 'fixed';
              container.style.top = '0';
              container.style.left = '0';
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.background = 'rgba(0,0,0,0.8)';
              container.style.zIndex = '1000';

              const iframe = document.createElement('iframe');
              iframe.src = url;
              iframe.style.width = '90%';
              iframe.style.height = '90%';
              iframe.style.margin = '5%';
              container.appendChild(iframe);

              const closeButton = document.createElement('button');
              closeButton.textContent = 'Close';
              closeButton.style.position = 'absolute';
              closeButton.style.top = '10px';
              closeButton.style.right = '10px';
              closeButton.onclick = () => {
                  document.body.removeChild(container);
                  window.URL.revokeObjectURL(url);
              };
              container.appendChild(closeButton);

              document.body.appendChild(container);
          } else {
              // Desktop version: Open in a new tab
              window.open(url, '_blank'); // Open the PDF in a new tab
              setTimeout(() => {
                  window.URL.revokeObjectURL(url);
              }, 100); // Clean up
          }
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
                  'Accept': 'application/zip',
              },
          });

          if (!response.ok) {
              if (response.status === 404) {
                  setError('File not found.');
              } else {
                  console.error('Failed to fetch file:', response.status);
                  setError('Failed to fetch file.');
              }
              return;
          }

          const zipBlob = await response.blob();
          const zip = await JSZip.loadAsync(zipBlob); // Unzip
          const pdfFileName = Object.keys(zip.files)[0]; // Get the PDF name
          const pdfBlob = await zip.file(pdfFileName).async('blob'); // Extract the PDF
          const url = window.URL.createObjectURL(pdfBlob);

          if (isMobile) {
              // Mobile version: Try download, fallback to opening if it fails
              const a = document.createElement('a');
              a.href = url;
              a.download = pdfFileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);

              // Fallback for mobile if download doesn't trigger
              setTimeout(() => {
                  if (document.body.contains(a)) {
                      // If the element is still in the DOM, assume download failed
                      window.open(url); // Open as a fallback
                  }
                  window.URL.revokeObjectURL(url);
              }, 500);
          } else {
              // Desktop version: Use original download logic
              const a = document.createElement('a');
              a.href = url;
              a.download = pdfFileName; // Use the actual PDF name
              a.click();
              window.URL.revokeObjectURL(url);
          }
      } catch (error) {
          console.error('Failed to download file:', error);
          setError('An unexpected error occurred while downloading the file.');
      }
  };

  const handleUnlinkFileFromJob = async (fileId, jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/files/unlink/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setError(errorData.errors || { general: errorData.message || 'Failed to unlink file from job application.' });
        } else {
          console.error('Failed to unlink file:', response.status);
          setError('Failed to unlink file from job application.');
        }
        return;
      }

      setError(null); // Clear errors (using null to match state type)
      fetchJobDetails(); // Refresh job details, including linked files
    } catch (error) {
      console.error('Failed to unlink file from job:', error);
      setError('An unexpected error occurred while unlinking the file.');
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

        <div className="linked-files">
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
                    <button className="custom-button" onClick={() => handleUnlinkFileFromJob(file.id, jobId)}>Unlink</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Application;