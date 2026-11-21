
let searchInput = document.getElementById('searchInput');
let searchButton = document.getElementById('searchButton');
let bookList = document.getElementById('bookList');
let likedBooks = [];
let recommendationMode = false;
let genreFilter = document.getElementById('genreFilter');

genreFilter.addEventListener('change', function() {
    if (recommendationMode) {
        showRecommendations();
    } else {
        searchBooks();
    }
});

function toggleMode() {
    recommendationMode = !recommendationMode;

    let modeButton = document.getElementById('modeToggle');
    let pageTitle = document.getElementById('pageTitle');
    let searchContainer = document.querySelector('.search-container');

    if (recommendationMode) {
        pageTitle.textContent = 'Recommendations';
        modeButton.textContent = 'Browse Books';
        searchContainer.style.display = 'none';

        showRecommendations();
    } else {
        pageTitle.textContent = 'Browse Books';
        modeButton.textContent = 'Recommendation Mode';
        searchContainer.style.display = 'flex';

        searchBooks();
    }
}

function displayBooks(books) {
    bookList.innerHTML = '';

    if (books.length === 0) {
        bookList.innerHTML = '<p>No books found.</p>';
        return;
    }

    books.forEach(book => {
        let bookElement = document.createElement('div');
        bookElement.classList.add('book-card');

        //cover
        let cover = document.createElement('img');

        if (book.cover_i) {
            cover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
            cover.alt = book.title + ' cover';
        } else {
            cover.src = 'https://via.placeholder.com/150x200?text=No+Cover';
            cover.alt = 'Cover unavailable';
        }
        //cover

        //title
        let title = document.createElement('h3');
        title.textContent = book.title || 'Unknown Title';
        //title

        //author
        let author = document.createElement('p');
        author.textContent = 'By ' + (
            book.author_name
                ? book.author_name.join(', ')
                : 'Unknown Author'
        );
        //author

        //year
        let year = document.createElement('p');
        year.textContent = book.first_publish_year
            ? 'First published: ' + book.first_publish_year
            : 'Publication year unknown';
        //year

        //like button
        let likeButton = document.createElement('button');
        likeButton.classList.add('like-button');

        function updateLikeButton() {
            let isLiked = likedBooks.some(
                likedBook => likedBook.key === book.key
            );

            bookElement.classList.toggle('liked', isLiked);
            likeButton.classList.toggle('active', isLiked);

            likeButton.textContent = isLiked
                ? '♥ Liked'
                : '♡ Add to favourites';
        }

        likeButton.addEventListener('click', function() {
            let index = likedBooks.findIndex(
                likedBook => likedBook.key === book.key
            );

            if (index === -1) {
                likedBooks.push(book);
            } else {
                likedBooks.splice(index, 1);
            }


            updateLikeButton();

            if (recommendationMode) {
                showRecommendations();
            } else if (searchInput.value.trim() === '') {
                displayBooks(likedBooks);
            }
        });

        updateLikeButton();
        //like button

        //added eements on book card
        bookElement.appendChild(cover);
        bookElement.appendChild(title);
        bookElement.appendChild(author);
        bookElement.appendChild(year);
        bookElement.appendChild(likeButton);

        bookList.appendChild(bookElement);
    });
}


function searchBooks() {
    let query = searchInput.value.trim();
    let genre = genreFilter.value;

    if (query === '' && genre === '') {
        displayBooks(likedBooks);
        return;
    }

    bookList.innerHTML = '<p>Searching...</p>';

    let searchQuery = query;

    if (genre !== '') {
        searchQuery += ' subject:' + genre;
    }

    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=30&fields=key,title,author_name,first_publish_year,cover_i,subject`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }

            return response.json();
        })
        .then(data => {
            displayBooks(data.docs);
        })
        .catch(error => {
            console.error(error);
            bookList.innerHTML = '<p>Something went wrong. Please try again.</p>';
        });
}

//update as user types, took help from AI
let debounceTimer;

searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function() {
        searchBooks();
    }, 300);
});

async function showRecommendations() {
    if (likedBooks.length === 0) {
        bookList.innerHTML = '<p>Like some books first!</p>';
        return;
    }

    bookList.innerHTML = '<p>Finding recommendations...</p>';

    try {
        let recommendedBooks = await generateRecommendations(likedBooks);

        let selectedGenre = genreFilter.value;

        if (selectedGenre !== '') {
            recommendedBooks = recommendedBooks.filter(book =>
                book.subject && book.subject.some(subject =>
                    subject.toLowerCase().includes(selectedGenre)
                )
            );
        }

        if (recommendedBooks.length === 0) {
            bookList.innerHTML = '<p>Could not find recommendations. Try liking more books!</p>';
            return;
        }

        displayBooks(recommendedBooks);

    } catch (error) {
        console.error(error);
        bookList.innerHTML = '<p>Could not generate recommendations.</p>';
    }
}
