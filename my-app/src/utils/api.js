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