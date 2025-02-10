import { ValidateSanitize } from '../services/validateSanitizeService';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (emailError || passwordError) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: 'Login failed. Please try again.' });
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
          <button type="submit" className="btn btn-dark">Login</button>
        </form>
        <div className="mt-4">
          <a className="link-dark link-opacity-50-hover" href="/register">or Register here</a>
        </div>
      </div>
    </div>
  );
};

export default Login;