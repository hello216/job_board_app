import ValidateSanitize from '../services/validateSanitizeService';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import '../css/LogReg.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailResult = ValidateSanitize.sanitizeAndValidateEmail(email);
    const passwordError = ValidateSanitize.validatePassword(password);

    if (emailResult.error) {
      setErrors({ general: emailResult.error });
    }
    if (passwordError.error) {
      setErrors({ general: passwordError.error });
    }
    if (emailResult.error || passwordError.error) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailResult.sanitized, password: password }),
        credentials: 'include',
      });

      let data;
      const isJson = response.headers.get('content-type')?.includes('application/json');

      if (response.ok) {
        navigate('/');
        return;
      }

      if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.status === 400) {
        if (isJson && data) {
          setErrors(data);
        } else if (data) {
          setErrors({ general: data });
        }
      } else if (response.status === 429) {
        setErrors({ general: 'Too many requests. Please try again later.' });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.log(error);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <div className="LogReg-container">
      <div>
        {errors.general && <p>{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          <div className="inputs">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="inputs">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="custom-button">Login</button>
        </form>

        <div>
          <a href="/register">or Register here</a>
        </div>
      </div>
    </div>
  );
};

export default Login;