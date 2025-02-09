import React, { useState, useEffect } from 'react';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

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

  return (
    <div id="home-container" className="container my-5">
      {error && <div className="alert alert-danger">{error}</div>}

      <button type="button" className="btn btn-dark " onClick={() => window.location.href = '/create-job'}>
        Add Application
      </button>

      {jobs.length === 0 ? (
        <p className="fs-4 text-center my-5">No jobs found. Please add a new job!</p>
      ) : (
        <table className="table table-dark table-hover mt-5">
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
            {jobs.map((job) => (
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
                  <a href={job.url} target="_blank" className="link-light link-opacity-50-hover">
                    {new URL(job.url).host}
                  </a>
                </td>
                <td>{job.location}</td>
                <td>
                  <a href={`/job-note/${job.id}`} className="btn btn-sm btn-light me-2">Notes</a>
                  <a href={`/edit-job/${job.id}`} className="btn btn-sm btn-light me-2">Edit</a>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;