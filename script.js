const movieListElement = document.getElementById('movieList');
const movieDetailsElement = document.getElementById('movieDetails');
const movieInput = document.getElementById('movieInput');
const apiKey = 'Enter OMDB API Key';
let currentPage = 1;
let totalResults = 0;
const moviesPerPage = 10;
let typingTimer;
const doneTypingInterval = 1000;
// searchMovie function to the input event on the movieInput field
movieInput.addEventListener('input', function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(searchMovie, doneTypingInterval);
});
function searchMovie() {
    const movieTitle = movieInput.value.trim();
    console.log(movieTitle);
    if (!movieTitle) {
        // Clear previous results and reset the current page
        movieListElement.innerHTML = '';
        movieDetailsElement.innerHTML = '';
        currentPage = 1;
        return;
    }
    // Clear previous results and reset the current page
    movieListElement.innerHTML = '';
    movieDetailsElement.innerHTML = '';
    currentPage = 1;
    // Fetch movie data from OMDB API 
    fetchMovies(movieTitle, currentPage);
}
// By Default
window.addEventListener('DOMContentLoaded', () => {
    const defaultMovieTitle = "Harry";
    movieInput.value = defaultMovieTitle;
    searchMovie();
  });
function fetchMovies(movieTitle, page) {
    fetch(`https://www.omdbapi.com/?s=${movieTitle}&apikey=${apiKey}&page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'True') {
                totalResults = parseInt(data.totalResults);
                Object.values(data.Search).forEach(movie => {
                    displayMovie(movie);
                });
                updatePagination();
            } else {
                alert('Movie not found!');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
function displayMovie(movieData) {
    console.log(movieData);
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.onclick = function () {
    // Fetch movie details using the movieID
    fetch(`https://www.omdbapi.com/?i=${movieData.imdbID}&apikey=${apiKey}`)
    .then(response => response.json())
        .then(data => {
            if (data.Response === 'True') {
                displayMovieDetails(data);
            } else {
                    alert('Movie details not found!');
                }
        })
        .catch(error => console.error('Error fetching data:', error));
    };
    const poster = movieData.Poster === 'N/A' ? 'no-poster.jpg' : movieData.Poster;
    movieElement.innerHTML = `<img src="${poster}" alt="${movieData.Title}">
                             <p>${movieData.Title}</p>`;
    movieListElement.appendChild(movieElement);
}
// get ratings from local storage or initialize if not present
function getMovieRatings() {
    const storedData = localStorage.getItem('movieRatings');
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        return {};
    }
}
// save ratings to local storage
function saveMovieRatings(data) {
    localStorage.setItem('movieRatings', JSON.stringify(data));
}
// update movie details with ratings and comments
function displayMovieDetails(movieData) {
    console.log("clicked");
    movieListElement.innerHTML = '';
    movieDetailsElement.innerHTML = '';
    const poster = movieData.Poster === 'N/A' ? 'no-poster.jpg' : movieData.Poster;
    movieDetailsElement.innerHTML = `
        <img src="${poster}" alt="${movieData.Title}">
        <h2>${movieData.Title}</h2>
        <p><strong>Title:</strong> ${movieData.Title}</p>
        <p><strong>Year:</strong> ${movieData.Year}</p>
        <p><strong>Rated:</strong> ${movieData.Rated}</p>
        <p><strong>Released:</strong> ${movieData.Released}</p>
        <p><strong>Runtime:</strong> ${movieData.Runtime}</p>
        <p><strong>Genre:</strong> ${movieData.Genre}</p>
        <p><strong>Director:</strong> ${movieData.Director}</p>
        <p><strong>Write:</strong> ${movieData.Writer}</p>
        <p><strong>Actor:</strong> ${movieData.Actor}</p>
        <p><strong>Plot:</strong> ${movieData.Plot}</p>
        <p><strong>Language:</strong> ${movieData.Language}</p>
        <p><strong>Country:</strong> ${movieData.Country}</p>
        <p><strong>Awards:</strong> ${movieData.Awards}</p>
        <p><strong>Metascore:</strong> ${movieData.Metascore}</p>
        <p><strong>imdbRating:</strong> ${movieData.imdbRating}</p>
        <p><strong>imdbVotes:</strong> ${movieData.imdbVotes}</p>
        <p><strong>DVD:</strong> ${movieData.DVD}</p>
        <p><strong>BoxOffice:</strong> ${movieData.BoxOffice}</p>
        <p><strong>Type:</strong> ${movieData.Type}</p>
        <a href="movie_app.html" class="back-button">Back</a>
        <button onclick="addComment('${movieData.imdbID}')">Add Comment</button>
        <input type="number" min="1" max="5" step="0.1" placeholder="Rate (1-5)" id="ratingInput_${movieData.imdbID}">
        <button onclick="addRating('${movieData.imdbID}')">Add Rating</button>
    `;
    // Get comments from localStorage (if they exist)
    const comments = localStorage.getItem(`comments_${movieData.imdbID}`);
    const commentsElement = document.createElement('p');
    commentsElement.innerHTML = `Comments: ${comments ? comments : 'No comments yet'}`;
    movieDetailsElement.appendChild(commentsElement);
    // Get ratings from localStorage (if they exist)
    const ratings = getMovieRatings();
    const ratingInput = document.getElementById(`ratingInput_${movieData.imdbID}`);
    ratingInput.value = ratings[movieData.imdbID] || '';

    const averageRating = calculateAverageRating(Object.values(ratings[movieData.imdbID]));
    const ratingsElement = document.createElement('p');
    ratingsElement.innerHTML = `Average Rating: ${averageRating}`;
    movieDetailsElement.appendChild(ratingsElement);
}

function addRating(imdbID) {
    const ratingInput = document.getElementById(`ratingInput_${imdbID}`);
    const rating = parseFloat(ratingInput.value);
    if (!isNaN(rating) && rating >= 1 && rating <= 10) {
        const ratings = getMovieRatings();
        ratings[imdbID] = ratings[imdbID] || [];
        ratings[imdbID].push(rating);
        saveMovieRatings(ratings);
        const movieData = JSON.parse(localStorage.getItem(`movie_${imdbID}`));
        displayMovieDetails(movieData);
    } else {
        alert('Please enter a valid rating between 1 and 10.');
    }
}
function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) {
        return 'No rating yet';
    }
    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = totalRating / ratings.length;
    return averageRating.toFixed(1);
}
function addComment(imdbID) {
    const comment = prompt('Enter your comment:');
    if (comment) {
        // Get existing comments from localStorage (if they exist)
        const existingComments = localStorage.getItem(`comments_${imdbID}`);
        const updatedComments = existingComments ? `${existingComments}\n${comment}` : comment;
        // Save the updated comments in localStorage
        localStorage.setItem(`comments_${imdbID}`, updatedComments);
        const movieData = JSON.parse(localStorage.getItem(`movie_${imdbID}`));
        displayMovieDetails(movieData);
    }
}
function updatePagination() {
    const totalPages = Math.ceil(totalResults / moviesPerPage);
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination');
    if (totalPages > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.addEventListener('click', handlePrevButtonClick);
        paginationContainer.appendChild(prevButton);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => handlePageClick(i));
            paginationContainer.appendChild(pageButton);
        }
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', handleNextButtonClick);
        paginationContainer.appendChild(nextButton);
    }
    movieListElement.appendChild(paginationContainer);
}
function handlePrevButtonClick() {
    if (currentPage > 1) {
        currentPage--;
        const movieTitle = movieInput.value.trim();
        movieListElement.innerHTML = '';
        fetchMovies(movieTitle, currentPage);
    }
}
function handleNextButtonClick() {
    const totalPages = Math.ceil(totalResults / moviesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        const movieTitle = movieInput.value.trim();
        movieListElement.innerHTML = '';
        fetchMovies(movieTitle, currentPage);
    }
}
function handlePageClick(pageNumber) {
    currentPage = pageNumber;
    const movieTitle = movieInput.value.trim();
    movieListElement.innerHTML = '';
    fetchMovies(movieTitle, currentPage);
}
