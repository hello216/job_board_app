import { ValidateSanitize } from '../services/validateSanitizeService';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailError = ValidateSanitize.sanitizeAndValidateEmail(email);
    const passwordError = ValidateSanitize.validatePassword(password);

    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
    }
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match.' }));
    }
    if (emailError || passwordError || password !== confirmPassword) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user`, {
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
        {errors.general && <p>{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p>{errors.email}</p>}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p>{errors.password}</p>}
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input className="form-control" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirm_password && <p>{errors.confirm_password}</p>}
          </div>
          <button type="submit" className="btn btn-dark">Register</button>
        </form>
        <div className="mt-4">
          <a className="link-dark link-opacity-50-hover" href="/login">or Login here</a>
        </div>
      </div>
    </div>
  );
};

export default Register;