import React, { useState, useEffect } from 'react';
import '../css/Home.css';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState({ column: '', ascending: true });
  const jobsPerPage = 10;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/getuserjobs`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else if (response.status === 429) {
          setErrors({ general: 'Too many requests. Please try again later.' });
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
        } else if (response.status === 429) {
          setErrors({ general: 'Too many requests. Please try again later.' });
        } else {
          setError('Failed to delete job');
        }
      } catch (error) {
        console.log(error);
        setError('Error deleting job');
      }
    }
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    const jobInfo = `${job.title} ${job.company} ${job.status} ${job.location}`;
    return jobInfo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortJobs = (column) => {
    setSort({ column, ascending: sort.column === column ? !sort.ascending : true });
  };

  const sortedJobs = sort.column ? 
    filteredJobs.sort((a, b) => {
      if (sort.column === 'createdAt') {
        return sort.ascending ? 
          new Date(a.createdAt) - new Date(b.createdAt) : 
          new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        let valueA = a[sort.column].toString().toLowerCase();
        let valueB = b[sort.column].toString().toLowerCase();

        return sort.ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
    }) 
    : filteredJobs;

  const SortingIndicator = ({ column }) => {
    if (sort.column === column) {
      return sort.ascending ? '↑' : '↓';
    }
    return '';
  };

  const currentSortedJobs = sortedJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);

  return (
    <div id="home-container" className="container my-5">
      {error && <div className="alert alert-danger">{error}</div>}

      <div id="home-top">
        <div className="d-flex justify-content-between mb-3" id="new-job-btn">
          <button type="button" className="custom-button me-2" onClick={() => window.location.href = '/create-job'}>
            Add Application
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs"
          />
        </div>
      </div>

      {jobs.length === 0 ? (
        <p className="fs-4 text-center my-5">No jobs found. Add a new job application to get started!</p>
      ) : jobs.length > 0 && filteredJobs.length === 0 && searchTerm !== '' ? (
        <p className="fs-4 text-center my-5">No jobs match your search.</p>
      ) : (
        <div className="job-list-container">
          <table className="custom-table desktop-table">
            <thead>
              <tr>
                <th onClick={() => sortJobs('createdAt')}>Submitted At <SortingIndicator column={'createdAt'} /> </th>
                <th onClick={() => sortJobs('status')}>Status <SortingIndicator column={'status'} /> </th>
                <th onClick={() => sortJobs('title')}>Title <SortingIndicator column={'title'} /> </th>
                <th onClick={() => sortJobs('company')}>Company <SortingIndicator column={'company'} /> </th>
                <th onClick={() => sortJobs('url')}>URL <SortingIndicator column={'url'} /> </th>
                <th onClick={() => sortJobs('location')}>Location <SortingIndicator column={'location'} /> </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSortedJobs.map((job) => (
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
                    <a href={`/job-note/${job.id}`} className="custom-button">Notes</a>
                    <a href={`/edit-job/${job.id}`} className="custom-button">Edit</a>
                    <button type="button" className="custom-button-danger" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mobile-card-list">
            {currentSortedJobs.map((job) => (
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
                  <a href={`/job-note/${job.id}`} className="custom-button">Notes</a>
                  <a href={`/edit-job/${job.id}`} className="custom-button">Edit</a>
                  <button type="button" className="custom-button-danger" onClick={() => handleDeleteJob(job.id)}>Delete</button>
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