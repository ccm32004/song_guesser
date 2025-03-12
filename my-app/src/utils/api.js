const API_BASE_URL = 'http://localhost:8888' //todo: put this in an env variable

//this is for autocomplete
export const fetchSongSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/songNames`);
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

export const fetchSnippet = async () => {
  try {
      const response = await fetch(`${API_BASE_URL}/getTrackSnippet`, {
          credentials: 'include', // Include cookies
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Fetched Song:', data);

      return { song: data, previewUrl: data.previewUrl };
  } catch (err) {
      console.error('Error fetching the snippet:', err);
      throw new Error('Error fetching the song snippet.');
  }
};

// Function to fetch the user's profile
export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, { credentials: 'include' });
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