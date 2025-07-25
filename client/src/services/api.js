//define API base url
const API_BASE_URL = "http://localhost:5000/api";

// Function to fetch data from the API
const request = async (url, method, data = null, requireAuth = false) => {
  //get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token || !token.trim()) {
      return {};
    } else {
      return { Authorization: `Bearer ${token}` };
    }
  };

  //define headers
  const headers = {
    "Content-Type": "application/json",
  };

  //check if authorization is required
  if (requireAuth) {
    Object.assign(headers, getAuthHeader());
  }

  //create configuration
  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  //trycatch to make request
  try {
    const response = await fetch(url, config);
    const result = await response.json();

    //check status
    if (!response.ok) {
      const error = new Error(result.message || "could not succeed");
      error.status = response.status;
      error.serverResponse = result
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
