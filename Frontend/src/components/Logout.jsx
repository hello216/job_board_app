import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user/logout`, {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          navigate('/login');
        } else {
          console.error('Logout failed:', response.status);
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Logout failed:', error);
        navigate('/login', { replace: true });
      }
    };

    logoutUser();
  }, [navigate]);

  return <div>Logging out...</div>;
}

export default Logout;