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

  return (
    <div id="home-container">
      {error && <p>{error}</p>}

      <button type="button" onClick={() => window.location.href = '/newjob'}>
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
                <td>{job.createdAt}</td>
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
                  <a href={`/edit/${job.id}`}>Edit</a>
                  <a href={`/delete/${job.id}`}>Delete</a>
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