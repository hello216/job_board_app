import { validatePassword } from '../services/inputValidation';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users`, {
          method: 'GET',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCSRFToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const passwordError = validatePassword(password);

    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match.' }));
    }
    if (passwordError || password !== confirmPassword) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <div>
      <div>
        <h2>Register</h2>
        {errors.general && <p>{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p>{errors.email}</p>}
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p>{errors.password}</p>}
          </div>
          <div>
            <label>Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirm_password && <p>{errors.confirm_password}</p>}
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;