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
      error.serverResponse = result;
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//USER REQUESTS
export const registerUser = async (username, email, password) => {
  try {
    const data = await request(`${API_BASE_URL}/users/auth/register`, "POST", {
      username,
      email,
      password,
    });

    if (data.error) {
      throw new Error(data.error);
    }
    return data;
    //return success message
  } catch (error) {
    if (error.status === 400) {
      throw new Error("Invalid input data");
    }
    if (error.status === 409) {
      throw new Error("User already exists");
    }
    console.error(error);
    throw error;
  }
};
//login user
export const loginUser = async (email, password) => {
  try {
    const data = await request(`${API_BASE_URL}/users/auth/login`, "POST", {
      email,
      password,
    });

    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    if (error.status === 401) {
      throw new Error("Invalid credentials");
    }
    console.error(error);
    throw error;
  }
};

//get all users
export const getAllUsers = async () => {
  try {
    const data = await request(`${API_BASE_URL}/users/all`, "GET", null, true);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
//create post func
export const createPost = (postData) => {
  try {
    request(`${API_BASE_URL}/posts/create`, "POST", postData, true);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
