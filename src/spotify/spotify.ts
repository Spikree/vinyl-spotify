
// Spotify API constants 
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SCOPE = 'user-library-read user-read-playback-state user-modify-playback-state streaming user-read-private';
const REDIRECT_URI = window.location.origin + '/callback';
const CLIENT_ID = 'd60a09c653f94f0d99a68da787b854c1'; // This needs to be replaced with your actual Spotify Client ID

// Generate a random string for the state parameter
export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (x) => possible[x % possible.length]).join('');
};

// Generate a code challenge from a code verifier
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// Initiate Spotify authorization with PKCE
export const initiateSpotifyAuth = async (): Promise<void> => {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);
  
  // Store the code verifier in localStorage for later use
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  // Construct the authorization URL with the correct redirect URI
  const params = new URLSearchParams({
    client_id: CLIENT_ID, // Use constant
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state,
    scope: SCOPE,
  });
  
  // Redirect to Spotify authorization page
  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
};

// Exchange authorization code for access token
export const getAccessToken = async (code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> => {
  const codeVerifier = localStorage.getItem('spotify_code_verifier') || '';
  
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID, // Use constant
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Token exchange error:', errorData);
    throw new Error(`Failed to retrieve access token: ${response.status} ${errorData.error || ''}`);
  }
  
  const data = await response.json();
  
  // Store tokens in localStorage
  localStorage.setItem('spotify_access_token', data.access_token);
  localStorage.setItem('spotify_refresh_token', data.refresh_token);
  localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
  
  return data;
};

// Refresh the access token
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID, // Use constant
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await response.json();
  
  localStorage.setItem('spotify_access_token', data.access_token);
  localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
  
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  
  return data.access_token;
};

// Get the current access token, refreshing if necessary
export const getValidAccessToken = async (): Promise<string> => {
  const accessToken = localStorage.getItem('spotify_access_token');
  const tokenExpiry = Number(localStorage.getItem('spotify_token_expiry'));
  
  // If token is expired or will expire in the next 5 minutes
  if (!accessToken || !tokenExpiry || tokenExpiry <= Date.now() + 300000) {
    return refreshAccessToken();
  }
  
  return accessToken;
};

// Spotify API fetch wrapper with authentication
export const spotifyFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const accessToken = await getValidAccessToken();
  
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }
  
  return response.json();
};

// Get user's saved albums
export const getUserAlbums = async (limit: number = 20, offset: number = 0): Promise<any> => {
  return spotifyFetch(`/me/albums?limit=${limit}&offset=${offset}`);
};

// Get album details
export const getAlbumDetails = async (albumId: string): Promise<any> => {
  return spotifyFetch(`/albums/${albumId}`);
};

// Start playback
export const startPlayback = async (deviceId: string, albumUri: string, position_ms: number = 0): Promise<void> => {
  await spotifyFetch(`/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify({
      context_uri: albumUri,
      position_ms,
    }),
  });
};

// Pause playback
export const pausePlayback = async (): Promise<void> => {
  await spotifyFetch('/me/player/pause', { method: 'PUT' });
};

// Skip to next track
export const skipToNext = async (): Promise<void> => {
  await spotifyFetch('/me/player/next', { method: 'POST' });
};

// Skip to previous track
export const skipToPrevious = async (): Promise<void> => {
  await spotifyFetch('/me/player/previous', { method: 'POST' });
};

// Initialize Spotify Web Playback SDK
export const initializePlayer = async (): Promise<Spotify.Player> => {
  return new Promise((resolve, reject) => {
    if (!window.Spotify) {
      reject(new Error('Spotify Web Playback SDK not loaded'));
      return;
    }
    
    const accessToken = localStorage.getItem('spotify_access_token');
    if (!accessToken) {
      reject(new Error('No access token available'));
      return;
    }
    
    const player = new window.Spotify.Player({
      name: 'Vinyl Player Web App',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
    });
    
    player.connect().then((success: boolean) => {
      if (success) {
        resolve(player);
      } else {
        reject(new Error('Failed to connect to Spotify Web Playback SDK'));
      }
    });
  });
};
