'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  if (modalContainer) modalContainer.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    if (modalImg) {
      modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    }
    if (modalTitle) modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    if (modalText) modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]") || document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase().trim();
    if (selectValue) selectValue.innerText = this.innerText;
    if (select) elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category.toLowerCase().trim()) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase().trim();
    if (selectValue) selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form && form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else if (formBtn) {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// Keyboard ESC close for modal
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modalContainer && modalContainer.classList.contains("active")) {
    testimonialsModalFunc();
  }
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const targetPage = this.innerText.trim().toLowerCase();

    for (let j = 0; j < pages.length; j++) {
      if (targetPage === pages[j].dataset.page.toLowerCase().trim()) {
        pages[j].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove("active");
      }
    }

    for (let k = 0; k < navigationLinks.length; k++) {
      if (navigationLinks[k].innerText.trim().toLowerCase() === targetPage) {
        navigationLinks[k].classList.add("active");
      } else {
        navigationLinks[k].classList.remove("active");
      }
    }

  });
}


// Last.fm Dynamic Songs Fetch
const LASTFM_API_KEY = "f1e78aa744475ddc5a0a5958e303f2d2";
const LASTFM_USERNAME = "Neko39_";

async function fetchLastfmTopTracks() {
  const songsListContainer = document.getElementById("songs-list");
  if (!songsListContainer) return;

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&limit=10&format=json&period=overall`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }
    const data = await response.json();
    const tracks = data.toptracks?.track;

    if (!tracks || tracks.length === 0) {
      throw new Error("No tracks found or invalid response structure");
    }

    renderSongs(tracks, songsListContainer);
  } catch (error) {
    console.error("Error fetching Last.fm top tracks:", error);
    renderFallbackSongs(songsListContainer);
  }
}

/**
 * Fetch album artwork from the iTunes Search API.
 * Returns a 300x300 image URL, or null if nothing was found.
 */
async function fetchItunesArt(trackName, artistName) {
  try {
    const query = encodeURIComponent(`${trackName} ${artistName}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=1&media=music`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // Replace the 100x100 thumbnail with a 300x300 version
      return data.results[0].artworkUrl100.replace("100x100bb", "300x300bb");
    }
  } catch (e) {
    // Silently ignore – placeholder will stay
  }
  return null;
}

function renderSongs(tracks, container) {
  container.innerHTML = ""; // Clear skeletons

  // Build all cards first (fast, no waiting)
  const imgElements = [];
  tracks.forEach((track) => {
    const songItem = document.createElement("li");
    songItem.className = "song-item";
    songItem.innerHTML = `
      <a href="${track.url}" target="_blank" rel="noopener noreferrer" class="song-item-link">
        <img src="" alt="${track.name}" class="song-img art-loading">
        <div class="song-info">
          <h4 class="song-title">${track.name}</h4>
          <p class="song-artist">${track.artist?.name || "Unknown Artist"}</p>
        </div>
        <div class="sound-wave">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </a>
    `;
    container.appendChild(songItem);
    imgElements.push(songItem.querySelector("img.song-img"));
  });

  // Now fetch all artwork in parallel and swap images as they arrive
  tracks.forEach((track, i) => {
    fetchItunesArt(track.name, track.artist?.name || "").then((artUrl) => {
      const imgEl = imgElements[i];
      if (!imgEl) return;
      const finalSrc = artUrl || "./img/icon-design.svg";
      imgEl.onload = () => imgEl.classList.remove("art-loading");
      imgEl.onerror = () => {
        imgEl.src = "./img/icon-design.svg";
        imgEl.classList.remove("art-loading");
      };
      imgEl.src = finalSrc;
    });
  });
}

function renderFallbackSongs(container) {
  const fallbacks = [
    { name: "Shape of You", artist: "Ed Sheeran", url: "https://www.last.fm/music/Ed+Sheeran/_/Shape+of+You" },
    { name: "Blinding Lights", artist: "The Weeknd", url: "https://www.last.fm/music/The+Weeknd/_/Blinding+Lights" },
    { name: "Stay", artist: "The Kid LAROI & Justin Bieber", url: "https://www.last.fm/music/The+Kid+LAROI+&+Justin+Bieber/_/Stay" },
    { name: "Starboy", artist: "The Weeknd", url: "https://www.last.fm/music/The+Weeknd/_/Starboy" },
    { name: "Sweater Weather", artist: "The Neighbourhood", url: "https://www.last.fm/music/The+Neighbourhood/_/Sweater+Weather" },
    { name: "Believer", artist: "Imagine Dragons", url: "https://www.last.fm/music/Imagine+Dragons/_/Believer" },
    { name: "Perfect", artist: "Ed Sheeran", url: "https://www.last.fm/music/Ed+Sheeran/_/Perfect" },
    { name: "As It Was", artist: "Harry Styles", url: "https://www.last.fm/music/Harry+Styles/_/As+It+Was" },
    { name: "Lovely", artist: "Billie Eilish & Khalid", url: "https://www.last.fm/music/Billie+Eilish+&+Khalid/_/Lovely" },
    { name: "Another Love", artist: "Tom Odell", url: "https://www.last.fm/music/Tom+Odell/_/Another+Love" }
  ];

  container.innerHTML = "";
  const imgElements = [];
  fallbacks.forEach((track) => {
    const songItem = document.createElement("li");
    songItem.className = "song-item";
    songItem.innerHTML = `
      <a href="${track.url}" target="_blank" rel="noopener noreferrer" class="song-item-link">
        <img src="" alt="${track.name}" class="song-img art-loading">
        <div class="song-info">
          <h4 class="song-title">${track.name}</h4>
          <p class="song-artist">${track.artist}</p>
        </div>
        <div class="sound-wave">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </a>
    `;
    container.appendChild(songItem);
    imgElements.push(songItem.querySelector("img.song-img"));
  });

  fallbacks.forEach((track, i) => {
    fetchItunesArt(track.name, track.artist).then((artUrl) => {
      const imgEl = imgElements[i];
      if (!imgEl) return;
      const finalSrc = artUrl || "./img/icon-design.svg";
      imgEl.onload = () => imgEl.classList.remove("art-loading");
      imgEl.onerror = () => {
        imgEl.src = "./img/icon-design.svg";
        imgEl.classList.remove("art-loading");
      };
      imgEl.src = finalSrc;
    });
  });
}

// Execute on load
fetchLastfmTopTracks();