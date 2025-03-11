const API_BASE_URL = 'http://localhost:8888' //todo: put this in an env variable

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
        const response = await fetch('http://localhost:8888/getTrackId', {
            credentials: 'include', // Include cookies
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Extract track ID from URI
        const trackId = data.uri.split(':').pop();
        const trackResponse = await fetch(`http://localhost:8888/track/${trackId}`);

        if (!trackResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const trackData = await trackResponse.json();
        const previewUrl = trackData.previewUrl;
        console.log('Preview URL:', previewUrl);

        return { song: data, previewUrl };
    } catch (err) {
        console.error('Error fetching the snippet or track details:', err);
        throw new Error('Error fetching the song snippet or track details.');
    }
}; 

// Function to fetch the user's profile
// Function to fetch the user's profile
export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' });
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