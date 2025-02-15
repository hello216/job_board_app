import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ValidateSanitize from '../services/validateSanitizeService';
import '../css/Notes.css';

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
    <div className="note-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {errors.note && <div className="alert alert-danger">{errors.note}</div>}
      <p>{job.note}</p>
      <div id="links">
        <a href="/">Go Home</a>
        <a href={`/edit-job/${job.id}`}>Edit</a>
      </div>
    </div>
  );
};

export default JobNote;