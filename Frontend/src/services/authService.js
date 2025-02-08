export const checkAuth = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/user/check`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};