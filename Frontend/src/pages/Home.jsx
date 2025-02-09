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
    <div id="home-container">
      {error && <p>{error}</p>}

      <button type="button" onClick={() => window.location.href = '/create-job'}>
        Add New Job Application
      </button>

      {jobs.length === 0 ? (
        <p>No jobs found. Please add a new job!</p>
      ) : (
        <table>
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
                  <a href={job.url} target="_blank">
                    {new URL(job.url).host}
                  </a>
                </td>
                <td>{job.location}</td>
                <td>
                  <a href={`/job-note/${job.id}`}>Notes</a>
                  <a href={`/edit-job/${job.id}`}>Edit</a>
                  <button type="button" onClick={() => handleDeleteJob(job.id)}>Delete</button>
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