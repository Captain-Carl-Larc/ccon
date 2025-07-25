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
      throw error
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

    return data;
  } catch (error) {
    // Handle specific HTTP status codes with fallback to server message
    if (error.status === 400) {
      throw new Error(
        error.serverResponse?.message || "Invalid registration data"
      );
    }
    if (error.status === 409) {
      throw new Error(error.serverResponse?.message || "User already exists");
    }
    if (error.status === 500) {
      throw new Error("Server error. Please try again later.");
    }

    // For other errors, preserve the original error
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

    // Store token if login successful
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    if (error.status === 401) {
      throw new Error(
        error.serverResponse?.message || "Invalid email or password"
      );
    }
    if (error.status === 400) {
      throw new Error(
        error.serverResponse?.message ||
          "Please provide valid email and password"
      );
    }
    if (error.status === 500) {
      throw new Error("Login service temporarily unavailable");
    }

    throw error;
  }
};

//get all users
export const getAllUsers = async (page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({ page, limit });
  return await request(
    `${API_BASE_URL}/users/all?${queryParams}`,
    "GET",
    null,
    true
  );
};
//create post func
export const createPost = async (postData) => {
  try {
    const data = await request(
      `${API_BASE_URL}/posts/create`,
      "POST",
      postData,
      true
    );
    return data;
  } catch (error) {
    if (error.status === 400) {
      throw new Error(error.serverResponse?.message || "Invalid post data");
    }
    if (error.status === 401) {
      throw new Error("Please log in to create posts");
    }
    if (error.status === 413) {
      throw new Error("Post content is too large");
    }
    throw error;
  }
};


//get all posts
export const getAllPosts = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({ page, limit });
    return await request(
      `${API_BASE_URL}/posts/all?${queryParams}`,
      "GET",
      null,
      true
    );
  } catch (error) {
    if (error.status === 401) {
      throw new Error("Please log in to view posts");
    }
    throw error;
  }
};

//get post by id
export const getPostById = async (postId) => {
  if (!postId) {
    throw new Error("Post ID is required");
  }

  try {
    return await request(`${API_BASE_URL}/posts/${postId}`, "GET", null, true);
  } catch (error) {
    if (error.status === 404) {
      throw new Error("Post not found");
    }
    if (error.status === 401) {
      throw new Error("Please log in to view this post");
    }
    if (error.status === 403) {
      throw new Error("You don't have permission to view this post");
    }
    throw error;
  }
};

//get posts of loggen in user
export const getMyPosts = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({ page, limit });
    return await request(
      `${API_BASE_URL}/posts/own?${queryParams}`,
      "GET",
      null,
      true
    );
  } catch (error) {
    if (error.status === 401) {
      throw new Error("Please log in to view your posts");
    }
    throw error;
  }
};