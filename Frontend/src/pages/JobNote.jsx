import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const JobNote = () => {
  const [job, setJob] = useState({
    note: '',
  });

  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobNote = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const jobData = await response.json();
          setJob({
            id: jobData.id,
            note: jobData.note,
          });
        } else {
          setError('Failed to fetch job note');
        }
      } catch (error) {
        console.log(error);
        setError('Error fetching job note');
      }
    };

    fetchJobNote();
  }, [id]);

  return (
    <div className="container my-5">
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <h2>Job Note</h2>
      <p className="fs-5">{job.note}</p>
      <div className="mt-4">
        <Link to="/" className="link-dark link-opacity-50-hover">Go Home</Link>
        <a href={`/edit-job/${job.id}`} className="link-dark link-opacity-50-hover mx-2">Edit</a>
      </div>
    </div>
  );
};

export default JobNote;