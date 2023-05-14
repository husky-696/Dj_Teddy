// Set up the Spotify API credentials
const CLIENT_ID = "your_client_id";
const CLIENT_SECRET = "your_client_secret";
const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE_URL = "https://api.spotify.com/v1";

let access_token = null;
let trackId = "4w9soAM7IrmYDhSXLp14p6";

// Get an access token from the Spotify API
async function getToken() {
  const response = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (response.ok) {
    const data = await response.json();
    access_token = data.access_token;
  }
}

// Play the track with the given track ID and create a progress bar
async function playTrack(trackId) {
  const response = await fetch(`${API_BASE_URL}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const audio = new Audio(data.preview_url);

    // Create a progress bar
    const progressBar = document.getElementById("slider");
    progressBar.max = audio.duration;

    // Update the progress bar position as the audio plays
    audio.addEventListener("timeupdate", () => {
      progressBar.value = audio.currentTime;
    });

    await audio.play();
    return audio;
  }
}


// Play the specified song and update the music player UI
async function playSong() {
  await getToken(); // Get the access token before making any API calls

  const trackId = "4w9soAM7IrmYDhSXLp14p6";
  const response = await fetch(`${API_BASE_URL}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const trackName = data.name;
    const artistName = data.artists[0].name;
    const albumImage = data.album.images[0].url;

    // Update the music player UI with the new song information
    document.getElementById("song-title").textContent = trackName;
    document.getElementById("song-artist").textContent = artistName;
    document.getElementById("song-img").src = albumImage;

    // Play the new song
    const audio = await playTrack(trackId);

    // Show the pause button and hide the play button
    document.getElementById("play-btn").style.display = "none";
    document.getElementById("pause-btn").style.display = "block";

    // Add event listener to pause button to pause audio playback
    document.getElementById("pause-btn").addEventListener("click", () => {
      audio.pause();
      document.getElementById("play-btn").style.display = "block";
      document.getElementById("pause-btn").style.display = "none";
    });
  }
}
