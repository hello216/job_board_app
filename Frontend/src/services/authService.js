export const checkAuth = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user/check`, {
      method: 'GET',
      credentials: 'include',
    });
    return true;
  } catch (error) {
    return false;
  }
};