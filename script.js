

// Spotify API credentials
const clientId = '340e05f6caf945cd80f574112688bc93'; // Your client id
const clientSecret = 'ea7e0a1eca364183b3f8c347a373e0cb'; // Your secret

// DOM elements
const searchBtn = document.querySelector('.search-container button');
const searchInput = document.querySelector('.search-container input');
const musicContainer = document.querySelector('.music-container');
const musicPlayer = document.querySelector('.music-player');
const musicImg = document.querySelector('.music-player img');
const musicTitle = document.querySelector('.music-player h2');
const musicArtist = document.querySelector('.music-player p');
const playBtn = document.querySelector('#play-btn');
const pauseBtn = document.querySelector('#pause-btn');
const audioElement = document.querySelector('#audio-element');
const progressBar = musicPlayer.querySelector('.slider');

// Audio state variables
let currentTrackId = '';
let audioObject;

// Get token using client credentials flow
const getToken = async () => {
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });
  const data = await result.json();
  return data.access_token;
};


// Search tracks with Spotify Web API
const searchTracks = async (searchQuery, accessToken) => {
  const result = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  const data = await result.json();
  return data.tracks.items;
};

// Play next track
const playNextTrack = () => {
  const currentTrack = musicContainer.querySelector('.selected');
  const nextTrack = currentTrack.nextElementSibling;
  if (nextTrack) {
    nextTrack.click();
  } else {
    const firstTrack = musicContainer.querySelector('.song');
    firstTrack.click();
  }
};

// Initialize audio object
const initAudio = (previewUrl) => {
  if (audioObject) {
    audioObject.pause();
    audioObject = null;
  }
  audioObject = new Audio(previewUrl);
  audioObject.addEventListener('ended', playNextTrack);
  audioObject.addEventListener('timeupdate', () => {
    const duration = formatTime(audioObject.duration);
    const currentTime = formatTime(audioObject.currentTime);
    musicPlayer.querySelector('.duration').textContent = `${currentTime} / ${duration}`;
    const progressBar = musicPlayer.querySelector('.progress');
    const progress = (audioObject.currentTime / audioObject.duration) * 100;
    progressBar.style.width = `${progress}%`;
    const slider = musicPlayer.querySelector('.slider');
    slider.value = progress;
    
  });
};

// Format time in minutes and seconds
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Select a track
const selectTrack = (trackId, previewUrl, imgSrc, title, artist) => {
  currentTrackId = trackId;
  musicContainer.querySelectorAll('.song').forEach((song) => {
    song.classList.remove('selected');
  });
  musicContainer.querySelector(`[data-track-id="${trackId}"]`).classList.add('selected');
  musicImg.src = imgSrc;
  musicTitle.textContent = title;
  musicArtist.textContent = artist;
  initAudio(previewUrl);
  playAudio();
};


// Search button click event
searchBtn.addEventListener('click', async () => {
  const searchQuery = searchInput.value;
  if (!searchQuery) {
    return;
  }
  try {
    const accessToken = await getToken();
    const tracks = await searchTracks(searchQuery, accessToken);
    musicContainer.innerHTML = '';
    tracks.forEach(track => {
      const musicEl = document.createElement('div');
      musicEl.classList.add('song', 'img');
      musicEl.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}">
        <div class="song-info">
          <h2>${track.name}</h2>
          <p>${track.artists.map(artist => artist.name).join(', ')}</p>
        </div>
      `;
      musicEl.setAttribute('data-track-id', track.id);
      musicEl.setAttribute('data-preview-url', track.preview_url);
      musicEl.setAttribute('data-img-src', track.album.images[0].url);
      musicEl.setAttribute('data-title', track.name);
      musicEl.setAttribute('data-artist', track.artists.map(artist => artist.name).join(', '));
      musicEl.addEventListener('click', () => {
        const trackId = musicEl.getAttribute('data-track-id');
        const previewUrl = musicEl.getAttribute('data-preview-url');
        const imgSrc = musicEl.getAttribute('data-img-src');
        const title = musicEl.getAttribute('data-title');
        const artist = musicEl.getAttribute('data-artist');
        selectTrack(trackId, previewUrl, imgSrc, title, artist);
      });
      musicContainer.appendChild(musicEl);
    });
  } catch (error) {
    console.error(error);
    musicContainer.innerHTML = `<p class="error-message">An error occurred while searching for tracks. Please try again later.</p>`;
  }
});



// Play button click event
playBtn.addEventListener('click', () => {
playAudio();
});

// Pause button click event
pauseBtn.addEventListener('click', () => {
pauseAudio();
});

// Play audio
const playAudio = () => {
if (!currentTrackId || !audioObject) {
return;
}
audioObject.play();
playBtn.style.display = 'none';
pauseBtn.style.display = 'inline-block';
};

// Pause audio
const pauseAudio = () => {
if (!currentTrackId || !audioObject) {
return;
}
audioObject.pause();
playBtn.style.display = 'inline-block';
pauseBtn.style.display = 'none';
};

