const verseElement = document.getElementById('verse');
const referenceElement = document.getElementById('reference');
const regenerateButton = document.getElementById('regenerate');
const favoriteButton = document.getElementById('favorite');
const favoritesList = document.getElementById('favorites-list');
const homePage = document.getElementById('home-page');
const favoritesPage = document.getElementById('favorites-page');
const homeTab = document.getElementById('home-tab');
const favoritesTab = document.getElementById('favorites-tab');
const noFavoritesMessage = document.getElementById('no-favorites-message');
const adContainer = document.getElementById('ad-container');
const closeAdButton = document.getElementById('close-ad');

let currentVerse = '';
let currentReference = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Close Ad Functionality
closeAdButton.addEventListener('click', () => {
  adContainer.style.display = 'none';
});

// Check if Ad Content Exists
setTimeout(() => {
  const adContent = document.querySelector('#ad-content script');
  if (adContent) {
    closeAdButton.style.display = 'block'; // Show close button only if ad exists
  } else {
    adContainer.style.display = 'none'; // Hide ad container if no ad content
  }
}, 1000);

// Fetch Bible Verse using Gemini API
async function fetchVerse() {
  const apiKey = 'AIzaSyAhH0xsR3E5l8JWTmM_8MPjncXPZuM_4lI'; // Move this to a backend if possible!
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Give me a random Malayalam Bible verse.' }] }]
      })
    });
    const data = await response.json();
    const verseText = data.candidates[0].content.parts[0].text;
    const [verse, reference] = verseText.split('—');
    currentVerse = verse.trim();
    currentReference = reference ? reference.trim() : '';

    const quoteBox = document.getElementById('quote-box');
    quoteBox.style.opacity = 0;
    setTimeout(() => {
      verseElement.textContent = currentVerse;
      referenceElement.textContent = `— ${currentReference}`;
      quoteBox.style.opacity = 1;

      const isFavorited = favorites.some(fav => fav.verse === currentVerse && fav.reference === currentReference);
      favoriteButton.classList.toggle('active', isFavorited);
    }, 300);
  } catch (error) {
    console.error('Error fetching verse:', error);
    verseElement.textContent = 'Failed to load verse. Please try again.';
    referenceElement.textContent = '';
  }
}

// Add or Remove from Favorites
function toggleFavorite(button, verse, reference) {
  const index = favorites.findIndex(fav => fav.verse === verse && fav.reference === reference);
  if (index === -1) {
    favorites.push({ verse, reference });
    button.classList.add('active');
  } else {
    favorites.splice(index, 1);
    button.classList.remove('active');
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoritesList();
}

// Update Favorites List
function updateFavoritesList() {
  favoritesList.innerHTML = '';
  if (favorites.length === 0) {
    noFavoritesMessage.style.display = 'block';
  } else {
    noFavoritesMessage.style.display = 'none';
  }
  favorites.forEach(({ verse, reference }) => {
    const listItem = document.createElement('li');
    const quoteBox = document.createElement('div');
    quoteBox.classList.add('quote-box');
    quoteBox.innerHTML = `
      <button class="favorite-btn active"><i class="fas fa-heart"></i></button>
      <p>${verse}</p>
      <small class="verse-reference">— ${reference}</small>
    `;
    listItem.appendChild(quoteBox);

    const heartButton = quoteBox.querySelector('.favorite-btn');
    heartButton.addEventListener('click', () => {
      quoteBox.classList.add('fade-out');
      setTimeout(() => {
        toggleFavorite(heartButton, verse, reference);
      }, 500);
    });
    favoritesList.prepend(listItem);
  });
}

// Switch Pages
function showHomePage() {
  homePage.style.display = 'block';
  favoritesPage.style.display = 'none';
  homeTab.classList.add('active');
  favoritesTab.classList.remove('active');
}

function showFavoritesPage() {
  homePage.style.display = 'none';
  favoritesPage.style.display = 'block';
  favoritesTab.classList.add('active');
  homeTab.classList.remove('active');
}

// Event Listeners
regenerateButton.addEventListener('click', () => {
  regenerateButton.classList.add('active');
  fetchVerse();
  setTimeout(() => regenerateButton.classList.remove('active'), 500);
});

favoriteButton.addEventListener('click', () => {
  toggleFavorite(favoriteButton, currentVerse, currentReference);
});

homeTab.addEventListener('click', showHomePage);
favoritesTab.addEventListener('click', showFavoritesPage);

// Initialize
fetchVerse();
showHomePage();
updateFavoritesList();
