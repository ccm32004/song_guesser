const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

//this is for autocomplete
export const fetchSongTitleSuggestions = async (artistName) => {
  try {
      const response = await fetch(`${API_BASE_URL}/songNames/${encodeURIComponent(artistName)}`);

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching song suggestions:', error);
      throw error;
  }
};

export const fetchSnippet = async (artistName) => {
  try {
      const response = await fetch(`${API_BASE_URL}/getTrackSnippet?artist=${encodeURIComponent(artistName)}`, {
          credentials: 'include', 
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();

      return { song: data, previewUrl: data.previewUrl };
  } catch (err) {
      console.error('Error fetching the snippet:', err);
      throw new Error('Error fetching the song snippet.');
  }
};

export const logout = () => {
  localStorage.removeItem('jwt_token');
  window.location.reload(); 
}

export const fetchUserProfile = async () => {
  try {
    const jwtToken = localStorage.getItem('jwt_token');

    if (!jwtToken) {
      throw new Error('No JWT token found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',  // Default GET request
      headers: {
        'Authorization': `Bearer ${jwtToken}`,  
        'Content-Type': 'application/json',    
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};


//fetch user emails
export const fetchUserStats = async () => {
  try {
    const jwtToken = localStorage.getItem('jwt_token');

    // Check if the token exists
    if (!jwtToken) {
      throw new Error('No JWT token found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/get-user-stats`, {
      method: 'GET',  // Default GET request
      headers: {
        'Authorization': `Bearer ${jwtToken}`,  
        'Content-Type': 'application/json',    
      },
      credentials: 'include', 
    });
    
    if (!response.ok) {
      throw new Error('User not found or error in request');
    }

    const data = await response.json();  
    return data;

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;  // Return null or handle the error case as needed
  }
};

//update user highscore
export const updateHighScore = async (artistName, difficulty, score) => {
  try {
    const jwtToken = localStorage.getItem('jwt_token');

    // Check if the token exists
    if (!jwtToken) {
      throw new Error('No JWT token found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/update-high-score`, {
      method: 'POST',  
      headers: {
        'Authorization': `Bearer ${jwtToken}`,  
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({
        artistName,   
        difficulty,   
        score         
      }),
    });

    // Check if the response is okay
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating high score');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error in updating high score:', error);
    return { status: 500, message: error.message };
  }
};


