const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const clearIcon = document.getElementById('clear-icon');
const resultsContainer = document.getElementById('results');
const paginationContainer = document.getElementById('pagination');
const loadingIndicator = document.getElementById('loading');

let currentPage = 1;
const perPage = 10;
let totalHits = 0;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    performSearch(1);
});

clearIcon.addEventListener('click', () => {
    queryInput.value = '';
    clearResults();
    clearIcon.style.display = 'none';
});

function clearResults() {
    resultsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    totalHits = 0;
    currentPage = 1;
}

async function performSearch(page = 1) {
    const query = queryInput.value;
    currentPage = page;

    loadingIndicator.style.display = 'block';
    clearResults();

    const response = await fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `query=${encodeURIComponent(query)}&page=${currentPage}&per_page=${perPage}`,
    });

    const data = await response.json();

    displayResults(data.results);

    totalHits = data.total_hits;
    renderPagination();

    window.scrollTo(0, 0);

    loadingIndicator.style.display = 'none';
    clearIcon.style.display = 'block';
}

function displayResults(results) {
    results.forEach((hit) => {
        const result = document.createElement('div');
        result.classList.add('result');

        const title = document.createElement('a');
        title.classList.add('title');
        title.href = hit.URL.replace('http://srv-captain--gitlab', 'https://gitlab.muravskiy.com');
        title.target = '_blank';
        title.textContent = hit.Title;

        const url = document.createElement('div');
        url.classList.add('url');
        url.textContent = hit.URL.replace('http://srv-captain--gitlab', 'https://gitlab.muravskiy.com').replace(/^https?:\/\//, '');

        const highlight = document.createElement('div');
        highlight.classList.add('highlight');
        highlight.textContent = truncateText(hit.Content, 300);

        const score = document.createElement('div');
        score.classList.add('score');
        score.textContent = `Скор: ${hit._score}`;

        result.appendChild(title);
        result.appendChild(url);
        result.appendChild(highlight);
        result.appendChild(score);

        resultsContainer.appendChild(result);
    });
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

function renderPagination() {
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalHits / perPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(i);
        });

        if (i === currentPage) {
            pageLink.classList.add('active');
        }

        paginationContainer.appendChild(pageLink);
    }
}