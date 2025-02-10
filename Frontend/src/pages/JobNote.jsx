import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ValidateSanitize from '../services/validateSanitizeService';

const JobNote = () => {
  const [job, setJob] = useState({ note: '' });
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

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
          const noteSanitized = ValidateSanitize.sanitizeAndValidateString(jobData.note || '');

          if(noteSanitized.error){
            setErrors(prev => ({ ...prev, note: noteSanitized.error }));
            setJob({ note: '' }); // clear note if there is an error
          } else {
            setJob({
              id: jobData.id,
              note: noteSanitized.sanitized,
            });
          }
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
      {errors.note && <div className="alert alert-danger mt-3">{errors.note}</div>}
      <p className="fs-5">{job.note}</p>
      <div className="mt-4">
        <Link to="/" className="link-dark link-opacity-50-hover">Go Home</Link>
        <a href={`/edit-job/${job.id}`} className="link-dark link-opacity-50-hover mx-2">Edit</a>
      </div>
    </div>
  );
};

export default JobNote;