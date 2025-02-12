import React, { useState, useEffect } from 'react';
import '../css/Home.css';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10; // number of jobs per page

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/getuserjobs`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else {
          setError('Failed to retrieve jobs');
        }
      } catch (error) {
        console.log(error);
        setError('Error fetching jobs');
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          const updatedJobs = jobs.filter(job => job.id !== id);
          setJobs(updatedJobs);
        } else {
          setError('Failed to delete job');
        }
      } catch (error) {
        console.log(error);
        setError('Error deleting job');
      }
    }
  };

  // Get the jobs to display on the current page
  const currentJobs = jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  // Calculate the number of pages
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div id="home-container" className="container my-5">
      {error && <div className="alert alert-danger">{error}</div>}

      <button type="button" className="btn btn-dark " id="new-job-btn" onClick={() => window.location.href = '/create-job'}>
        Add Application
      </button>

      {jobs.length === 0 ? (
        <p className="fs-4 text-center my-5">No jobs found. Please add a new job!</p>
      ) : (
        <div className="job-list-container">
          <table className="custom-table mt-5 desktop-table">
            <thead>
              <tr>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Title</th>
                <th>Company</th>
                <th>URL</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    {new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }).format(new Date(job.createdAt))}
                  </td>
                  <td>{job.status}</td>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>
                    <a href={job.url} target="_blank" className="custom-link">
                      {new URL(job.url).host}
                    </a>
                  </td>
                  <td>{job.location}</td>
                  <td id="actions">
                    <a href={`/job-note/${job.id}`} className="custom-black-action-button">Notes</a>
                    <a href={`/edit-job/${job.id}`} className="custom-black-action-button">Edit</a>
                    <button type="button" className="custom-delete-button" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mobile-card-list">
            {currentJobs.map((job) => (
              <div key={job.id} className="mobile-card">
                <h3 className="card-title">{job.title}</h3>
                <div className="card-info">
                  <p><span>Submitted At:</span> {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).format(new Date(job.createdAt))}</p>
                  <p><span>Status:</span> {job.status}</p>
                  <p><span>Company:</span> {job.company}</p>
                  <p><span>URL:</span> <a href={job.url} target="_blank" className="custom-link">{new URL(job.url).host}</a></p>
                  <p><span>Location:</span> {job.location}</p>
                </div>
                <div className="card-actions">
                  <a href={`/job-note/${job.id}`} className="custom-black-action-button">Notes</a>
                  <a href={`/edit-job/${job.id}`} className="custom-black-action-button">Edit</a>
                  <button type="button" className="custom-delete-button" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-center">
              {currentPage === 1 ? (
                <li className="page-item disabled">
                  <span className="page-link bg-dark text-light">Previous</span>
                </li>
              ) : (
                <li className="page-item">
                  <button className="page-link bg-dark text-light" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                </li>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button className={`page-link bg-dark text-light ${currentPage === page ? 'border-white' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                </li>
              ))}
              {currentPage === totalPages ? (
                <li className="page-item disabled">
                  <span className="page-link bg-dark text-light">Next</span>
                </li>
              ) : (
                <li className="page-item">
                  <button className="page-link bg-dark text-light" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Home;