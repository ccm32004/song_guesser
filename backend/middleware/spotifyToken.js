const axios = require('axios');

async function getValidAccessToken(req, res, next) {
    try {
        const fiveMinutesBeforeExpiration = 5 * 60 * 1000;
        if (
            !req.session.clientAccessToken || // No token exists
            Date.now() > req.session.token_expiry - fiveMinutesBeforeExpiration // Token expires in 5 minutes or less
        ) {
            console.log("client token is expired or about to expire, fetching a new one...");
            
            const { access_token, expires_in } = await getClientCredentialsAccessToken();

            req.session.clientAccessToken = access_token;
            req.session.token_expiry = Date.now() + expires_in * 1000; // expires_in is in seconds, so multiply by 1000 to get milliseconds
        }

        else if (!req.session.clientAccessToken && // No client credential token exists at this point, and for the most part user will never enter here
            Date.now() > req.session.token_expiry - fiveMinutesBeforeExpiration ) {
            console.log("auth flow token is expired or about to expire, fetching a new one...");

            await refreshToken(req, res);
        }

        if (!req.session.clientAccessToken && !req.session.access_token) {
            return res.status(401).json({ error: 'Unauthorized access - No valid token' });
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error retrieving access token' });
    }
}

/*FUNCTIONS TO GET NEW TOKENS/REFRESH TOKENS*/

async function getClientCredentialsAccessToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    try {
        const response = await axios.post(tokenUrl, new URLSearchParams({
            grant_type: 'client_credentials',
        }), {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in, // this is in seconds
        };
    } catch (error) {
        console.error("Error getting client credentials access token:", error);
        throw new Error('Failed to get access token');
    }
}

// Function to refresh the token using the refresh_token stored in the session
async function refreshToken(req, res) {
    const refresh_token = req.session.refresh_token;

    if (!refresh_token) {
        return res.status(401).json({ error: 'No refresh token available' });
    }

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
        },
        data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        })
    };

    try {
        const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });

        if (response.status === 200) {
            const { access_token, expires_in } = response.data;

            // Save the new access token and calculate its expiry time
            req.session.access_token = access_token;
            req.session.token_expiry = Date.now() + expires_in * 1000; // expires_in is in seconds, convert to milliseconds
            await req.session.save();

            console.log('Token refreshed successfully');
        } else {
            res.status(response.status).json({ error: 'Failed to refresh token' });
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ error: 'Error refreshing token' });
    }
}

module.exports = { getValidAccessToken };
