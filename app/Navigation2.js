/**
 * Navigation.js
 *
 */

// PAGE INITIALIZATION

let swiper;

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');

    swiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        autoHeight: true,
        loop: true,
        speed: 500,
        spaceBetween: 20, 
        effect: 'slide',
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        on: {
            slideChangeTransitionStart: function () {
                document.querySelectorAll('section').forEach((section) => {
                    const h1 = section.querySelector('h1');
                    const description = section.querySelector('.section-description');
                    if (h1) h1.classList.remove('animate-h1');
                    if (description) description.classList.remove('animate-description');
                });
            },
            
            slideChangeTransitionEnd: function () {
                const activeSection = this.slides[this.activeIndex].querySelector('section');
                const h1 = activeSection.querySelector('h1');
                const description = activeSection.querySelector('.section-description');
                if (h1) h1.classList.add('animate-h1');
                if (description) description.classList.add('animate-description');
            },
        },
    });

    const firstSection = swiper.slides[swiper.activeIndex].querySelector('section');;
    if (firstSection) {
        firstSection.classList.add('animate-section');
        const h1 = firstSection.querySelector('h1');
        const description = firstSection.querySelector('.section-description');
        if (h1) h1.classList.add('animate-h1');
        if (description) description.classList.add('animate-description');
    }

    links.forEach((link, index) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const href = link.getAttribute('href');
            const targetSection = document.querySelector(href);
            const navigationType = link.getAttribute('navigation-type');
            const animationType = link.getAttribute('animation-type');
            
            

            if (animationType === 'fade') {
                targetSection.classList.add('fade-animation');
            } else if (animationType === 'zoom') {
                targetSection.classList.remove('zoom-animation');
                targetSection.classList.add('zoom-animation');
            }

            if (navigationType === 'slide') {
                swiper.slideTo(index);
            }

            
        });
    });

    let dPos = { x: 0, y: 0 };

    interact('.movie-block')
    .draggable({
        listeners: {
            start(event) {
                dPos = { x: 0, y: 0 };
                event.target.classList.add('dragging');
                event.target.style.transition = "transform 0.2s";
                event.target.style.transform = "scale(0.5)";
                swiper.disable();
                
                const rect = event.target.getBoundingClientRect();
                event.target.dataset.originalWidth = rect.width;
                event.target.dataset.originalHeight = rect.height;
            },
            move(event) {
                swiper.disable();
                const target = event.target;
                const scaleFactor = 0.7;
                const adjustedX = (dPos.x + event.delta.x) / scaleFactor;
                const adjustedY = (dPos.y + event.delta.y) / scaleFactor;

                target.style.transform = `scale(${scaleFactor}) translate(${adjustedX}px, ${adjustedY}px)`;
                dPos.x += event.delta.x;
                dPos.y += event.delta.y;

                target.style.zIndex = '1000';
            },
            end(event) {
                swiper.disable()
                const target = event.target;
                target.style.transition = "transform 0.2s";
                target.style.transform = "scale(1)";
                dPos = { x: 0, y: 0 };
                target.style.zIndex = '';
                target.classList.remove('dragging');
                swiper.enable();
            }
        }
    });

    interact('.drop-zone')
        .dropzone({
            accept: '.movie-block',
            overlap: 0.01,

            ondropactivate(event) {
                const dropZone = event.target;
                dropZone.classList.add('active-dropzone');
            },
            ondragenter(event) {
                const dropZone = event.target;
                dropZone.classList.add('hovered-dropzone');
            },
            ondragleave(event) {
                const dropZone = event.target;
                dropZone.classList.remove('hovered-dropzone');
            },
            ondropdeactivate(event) {
                const dropZone = event.target;
                dropZone.classList.remove('active-dropzone', 'hovered-dropzone');
            },

            ondrop(event) {
                const dragged = event.relatedTarget;
                const dropZone = event.target;
                const draggedId = parseInt(dragged.dataset.myId);
                const dropZoneId = parseInt(dropZone.dataset.myId);

                if (draggedId === dropZoneId) return;

                const draggedItem = my_results.splice(draggedId, 1)[0];
                const dropIndex = dropZoneId;

                my_results.splice(dropIndex, 0, draggedItem);
                localStorage.my_results = JSON.stringify(my_results);
                my_results = JSON.parse(localStorage.my_results);

                document.getElementById('movies').innerHTML = resultsView(my_results);
                document.querySelectorAll('.swiper-slide').forEach((slide) => {
                const h1 = slide.querySelector('h1');
                const description = slide.querySelector('.section-description');
                if (h1) {
                    h1.style.opacity = 1;
                    h1.style.transform = 'translateY(0)';
                }
                if (description) {
                    description.style.opacity = 1;
                    description.style.transform = 'translateX(0)';
                }
                });
            }
        });
});

// DATA MODEL

let initial_movies = [
    { tmdb_id: null, title: "Superlópez", director: "Javier Ruiz Caldera", thumbnail: "files/superlopez.png", release_date: null, vote_average: null, overview: null, original_language: null, keywords: ["Hello","Hi"] },
    { tmdb_id: null, title: "Jurassic Park", director: "Steven Spielberg", thumbnail: "files/jurassicpark.png", release_date: null, vote_average: null, overview: null, original_language: null, keywords: null },
    { tmdb_id: null, title: "Interstellar", director: "Christopher Nolan", thumbnail: "files/interstellar.png", release_date: null, vote_average: null, overview: null, original_language: null, keywords: null }
];
localStorage.my_movies = localStorage.my_movies || JSON.stringify(initial_movies);
let my_movies = JSON.parse(localStorage.my_movies);
    
let initial_keywords = [];
localStorage.my_keywords = localStorage.my_keywords || JSON.stringify(initial_keywords);
let my_keywords = JSON.parse(localStorage.my_keywords);

let initial_results = [];
localStorage.my_results= localStorage.my_results || JSON.stringify(initial_results);
let my_results = JSON.parse(localStorage.my_results);

// API ACCESS

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNjc2NTg1ZTY2N2QzZjQyOGNiMWFkMTZmOTFkOGY0MiIsIm5iZiI6MTczMTUxOTU2Ni4yODU3NDEzLCJzdWIiOiI2NzMyMzM1NTBkNzU4MDQwZWI0YjFlMzIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.OYo3fzuXa2FH-YVyxaLezUdr2whuIziWBJDytKyAG0Y'
    }
};

// VIEWS

const searchView = () => {
    view = `<h1>Welcome to Netflix</h1>
            <p class="section-description">This is the Home section.</p>
            <div class="field" id="field-search">
                <input type="text" id="search-query" placeholder="Search for movies">
                <button class="search" id="search-button">Search</button>
                <div id="spinner" style="display:none;">
                    <div class="spinner"></div>
                </div>
            </div>`;
    return view;
}

const resultsView = (results) => {
    let view = `<h1>Movies</h1>
                <p class="section-description">Explore our collection of movies.</p>
                <div class="movies-container">`;
            
    if (results.length > 0) {
        results.forEach((movie, i) => {
                view += `
                    <div class="movie-block" data-my-id="${i}">
                    <div class="drop-zone" data-my-id="${i}"></div>
                    <div class="movie" id="result-movie" data-my-id="${i}">
                        <div class="movie-img">
                            <img class="add-from-api-image" data-my-id="${i}" src="https://image.tmdb.org/t/p/w200${movie.poster_path}" onerror="this.src='files/noimage.png'"/>
                        </div>
                        <div class="title" title="${movie.title || "<em>No title</em>"}">${movie.title || "<em>No title</em>"}</div>
                        <div class="release-date"><strong>${movie.release_date || "<em>No release date</em>"}</strong></div>
                        <div class="actions">
                            <button class="add-from-api" data-my-id="${i}">Add</button>
                            <button class="keywords" data-my-id="${i}">Details</button>
                        </div>
                    </div>
                    </div>`;
            });
        view +=  `</div>`;
    } else {
        view += `<p style="text-align: center; margin: 0 auto;"><em>No results found</em></p>`;
    }
    return view;
};

const indexView = (movies) => {
    let i=0;
    let view = "";
    view +=`<h1>Your Profile</h1>
            <p class="section-description">Manage your account and preferences.</p>
            <div class="scrollsnap-carousel">\n`;

    while(i < movies.length) {
      view += `
        <div class="slide">
		<div class="content">
		<div class="content-wrapper">
        <div class="movie">
           <div class="movie-img">
                <img data-my-id="${i}" src="${movies[i].thumbnail}" onerror="this.src='files/noimage.png'" onclick="showModalContr(${i})"/>
           </div>
           <div class="title" title="${movies[i].title || "<em>No title</em>"}">
               ${movies[i].title || "<em>No title</em>"}
           </div>
           <div class="actions">
                <!-------------------Insert here "Show" and "Delete" buttons------------------>
               <button class="edit" data-my-id="${i}">Edit</button>
               <button class="show" data-my-id="${i}">Show</button>
               <button class="delete" data-my-id="${i}">Delete</button>
            </div>
        </div>
        </div>
        </div>
        </div>\n`;
      i = i + 1;
    };
    view += `</div>\n`;

    view += `<div class="actions">
                <!-----------------------Insert here "Add" and "Reset" buttons---------------->
                <button class="new">Add</button>
                <button class="reset">Reset</button>
                <button class="my-keywords">View My Keywords</button>
            </div>`;

    return view;
};

const editModalView = (i, movie) => {
    return `<h2>Edit Movie </h2>
        <div class="field">
        Title <br>
        <input  type="text" id="edit-title" placeholder="Title" 
                value="${movie.title || ''}">
        </div>
        <div class="field">
        Director <br>
        <input  type="text" id="edit-director" placeholder="Director" 
                value="${movie.director || ''}">
        </div>
        <div class="field">
        Thumbnail <br>
        <input  type="text" id="edit-thumbnail" placeholder="Thumbnail URL" 
                value="${movie.thumbnail}">
        </div>
        <div class="field">
            Release Date <br>
            <input type="date" id="edit-release-date" placeholder="Release Date" value="${movie.release_date}">
        </div>
        <div class="field">
            Average Vote <br>
            <input type="number" id="edit-vote-average" placeholder="Average Vote" value="${movie.vote_average}" step="0.1" min="0" max="10">
        </div>
        <div class="field">
            Overview <br>
            <textarea id="edit-overview" placeholder="Overview" value="${movie.overview}"></textarea>
        </div>
        <div class="field">
            Original Language <br>
            <input type="text" id="edit-original-language" placeholder="Original Language" value="${movie.original_language || ''}">
        </div>
        <div class="actions">
            <button class="update" id="update" data-my-id="${i}">Update</button>
            <button class="back">Back</button>
        </div>`;
}

const newModalView = () => {
    return `<h2>Create Movie</h2>
        <div class="field">
            Title <br>
            <input type="text" id="new-title" placeholder="Title">
        </div>
        <div class="field">
            Director <br>
            <input type="text" id="new-director" placeholder="Director">
        </div>
        <div class="field">
            Thumbnail <br>
            <input type="text" id="new-thumbnail" placeholder="Thumbnail URL">
        </div>
        <div class="field">
            Release Date <br>
            <input type="date" id="new-release-date" placeholder="Release Date">
        </div>
        <div class="field">
            Average Vote <br>
            <input type="number" id="new-vote-average" placeholder="Average Vote" step="0.1" min="0" max="10">
        </div>
        <div class="field">
            Overview <br>
            <textarea id="new-overview" placeholder="Overview"></textarea>
        </div>
        <div class="field">
            Original Language <br>
            <input type="text" id="new-original-language" placeholder="Original Language">
        </div>
        <div class="actions">
            <button class="create" id="create">Save</button>
            <button class="back">Back</button>
        </div>`;
}

const myKeywordsModalView = (my_keywords) => {
    let view = `<h2>My Keywords</h2>
                <div class="keyword-list">`;
    if (my_keywords.length === 0) {
        view += `<p> <em>No keywords in your list </em> </p>`;
    } else {
        my_keywords.forEach(keyword => {
            view += `<div class="keyword-item">
                        ${keyword}
                        <button class="remove-keyword" data-keyword="${keyword}">Remove</button>
                    </div>`;
        });
    }
    view += `</div>
            <button class="back">Back</button>`;
    return view;
};

// CONTROLLERS 
const indexContr = () => {
 let my_movies = JSON.parse(localStorage.my_movies);
 document.getElementById('profile').innerHTML = indexView(my_movies);
 window.scrollTo(0, 0);
 document.querySelectorAll('.swiper-slide').forEach((slide) => {
    const h1 = slide.querySelector('h1');
    const description = slide.querySelector('.section-description');
    if (h1) {
        h1.style.opacity = 1;
        h1.style.transform = 'translateY(0)';
    }
    if (description) {
        description.style.opacity = 1;
        description.style.transform = 'translateX(0)';
    }
    });
};

const newModalContr = () => {
    document.querySelector(".new-modal-body").innerHTML = newModalView();
    document.getElementById("new-modal").style.display = "flex";
};

const createContr = () => {
    // Complete: controller that creates a new movie in the model saved in localStorage
    // ...
    let my_movies = JSON.parse(localStorage.my_movies);
    let newMovie = {
        tmdb_id: null,
        title: document.getElementById('new-title').value,
        director: document.getElementById('new-director').value,
        thumbnail: document.getElementById('new-thumbnail').value,
        release_date: document.getElementById('new-release-date').value,
        vote_average: document.getElementById('new-vote-average').value,
        overview: document.getElementById('new-overview').value,
        original_language: document.getElementById('new-original-language').value
    };
    const isDuplicate = my_movies.some(movie => 
        movie.title === newMovie.title && 
        movie.director === newMovie.director && 
        movie.thumbnail === newMovie.thumbnail
    );
    
    if (isDuplicate) {
        alert("This movie already exists in your list.");
    } else {
        
        if (newMovie.title && newMovie.director && newMovie.thumbnail) {
            my_movies.push(newMovie);
            localStorage.my_movies = JSON.stringify(my_movies);
            window.scrollTo(0, 0);
            document.getElementById("new-modal").style.display = "none";
            indexContr();
        } else {
            alert("Please fill in all fields.");
        }
    }
};

const editModalContr = (i) => {
    let movie = JSON.parse(localStorage.my_movies)[i];
    document.querySelector(".edit-modal-body").innerHTML = editModalView(i, movie);
    document.getElementById("edit-modal").style.display = "flex";
};

const updateContr = (i) => {
    let my_movies = JSON.parse(localStorage.my_movies);
    my_movies[i].title    = document.getElementById('edit-title').value;
    my_movies[i].director  = document.getElementById('edit-director').value;
    my_movies[i].thumbnail = document.getElementById('edit-thumbnail').value;
    my_movies[i].release_date = document.getElementById('edit-release-date').value;
    my_movies[i].vote_average = document.getElementById('edit-vote-average').value;
    my_movies[i].overview = document.getElementById('edit-overview').value;
    my_movies[i].original_language = document.getElementById('edit-original-language').value;
    localStorage.my_movies = JSON.stringify(my_movies);
    document.getElementById("edit-modal").style.display = "none";
    window.scrollTo(0, 0);
    indexContr();
};

const deleteContr = (i) => {
    if (confirm("Are you sure you want to delete this movie?")) {
        let my_movies = JSON.parse(localStorage.my_movies);
        my_movies.splice(i, 1);
        localStorage.my_movies = JSON.stringify(my_movies);
        indexContr();
    }
};

const resetContr = () => {
    // Complete: controller that resets the model saved in localStorage with the original movies
    if (confirm("Are you sure you want to reset the database?")) {
        localStorage.my_movies = JSON.stringify(initial_movies);
        localStorage.my_keywords = JSON.stringify(initial_keywords);
        my_movies = JSON.parse(localStorage.my_movies);
        my_keywords = JSON.parse(localStorage.my_keywords);
        indexContr();
    }
};

const searchContr = (query) => {
    if (!query) {
        alert("Please enter a movie title.");
        return;
    }

    document.getElementById('spinner').style.display = 'flex';

    fetch('https://api.themoviedb.org/3/search/movie?query=' + query, options)
        .then(response => response.json())
        .then(data => {
            document.getElementById('spinner').style.display = 'none';
            my_results = data.results;
            document.getElementById('movies').innerHTML = resultsView(my_results);
            swiper.slideTo(1);
        })
        .catch(error => {
            document.getElementById('spinner').style.display = 'none';
            alert('Error fetching data from TMDb');
        });
};

const addFromAPIContr = async (movieData, ev) => {
    let my_movies = JSON.parse(localStorage.my_movies);
    const movieExists = my_movies.some(movie => movie.tmdb_id === movieData.id);
    const addButton = ev.target;
    addButton.disabled = true;

    if (movieExists) {
        alert("This movie is already in your list.");
    } else {
        const movieKeywords = await keywordsContr(movieData.id);
        const newMovie = {
            tmdb_id: movieData.id,
            title: movieData.title,
            director: null,
            thumbnail: `https://image.tmdb.org/t/p/w200${movieData.poster_path}`,
            release_date: movieData.release_date, 
            vote_average:movieData.vote_average,
            overview: movieData.overview,
            original_language: movieData.original_language,
            keywords: movieKeywords
        };
        
        my_movies.push(newMovie);
        localStorage.my_movies = JSON.stringify(my_movies);
        my_movies = JSON.parse(localStorage.my_movies);
        document.getElementById('profile').innerHTML = indexView(my_movies);
        const addButton = ev.target;
        addButton.disabled = true;
        const successMessage = document.getElementById("success-message");
        successMessage.style.display = "block";
        setTimeout(() => {
            my_movies = JSON.parse(localStorage.my_movies);
            document.getElementById('movies').innerHTML = resultsView(my_results);
            document.getElementById('profile').innerHTML = indexView(my_movies);
            const successMessage = document.getElementById("success-message");
            successMessage.style.display = "block";
        }, 200);
        setTimeout(() => {
            document.getElementById('movies').innerHTML = resultsView(my_results);
            document.getElementById('profile').innerHTML = indexView(my_movies);
            const successMessage = document.getElementById("success-message");
            successMessage.style.display = "none";
            my_movies = JSON.parse(localStorage.my_movies);
            document.getElementById('profile').innerHTML = indexView(my_movies);
        }, 2000);
    }
};

const processKeywords = (keywords) => {
    const processedKeywords = [];
    for (const keyword of keywords) {
        const cleanedKeyword = keyword.name
            .replace(/[^a-zñáéíóú0-9 ]+/igm, "") // Remove special characters
            .trim()                              // Remove extra spaces
            .toLowerCase();                      // Normalize to lowercase
        if (cleanedKeyword.length > 0) {
            processedKeywords.push(cleanedKeyword);
        }
    }
    processedKeywords.sort();
    processedKeywords.shift();
    return processedKeywords;
};

const addKeywordToList = (keyword) => {
    let myKeywords = JSON.parse(localStorage.getItem('my_keywords') || '[]');
    if (!myKeywords.includes(keyword)) {
        myKeywords.push(keyword);
        myKeywords.sort();
        localStorage.setItem('my_keywords', JSON.stringify(myKeywords));
        alert("Keyword added to your custom list!");
    } else {
        alert("This keyword is already in your list.");
    }
};

const removeKeywordContr = (keyword) => {
    let myKeywords = JSON.parse(localStorage.getItem('my_keywords') || '[]');
    myKeywords = myKeywords.filter(k => k !== keyword);
    localStorage.setItem('my_keywords', JSON.stringify(myKeywords));
    myKeywordsModalContr();
};

const myKeywordsModalContr = () => {
    let my_keywords = JSON.parse(localStorage.getItem('my_keywords') || '[]');
    document.querySelector(".my-keywords-modal-body").innerHTML = myKeywordsModalView(my_keywords);
    document.getElementById("my-keywords-modal").style.display = "flex";
};

const keywordsContr = async (movieId) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/keywords`, options);
        const data = await response.json();
        const keywords = data.keywords || [];
        const processedKeywords = processKeywords(keywords);
        return processedKeywords;
    } catch (err) {
        console.error("Error fetching keywords:", err);
        alert("Error fetching keywords.");
        return [];
    }
};

const showModalContr = (i) => {
    my_movies = JSON.parse(localStorage.my_movies);
    document.getElementById("show-modal-director").querySelector("span").innerHTML = my_movies[i].director || "<em>No director specified</em>";
    document.getElementById("show-modal-average-vote").querySelector("span").innerHTML = my_movies[i].vote_average || "<em>No average vote</em>";
    document.getElementById("show-modal-original-language").querySelector("span").innerHTML = my_movies[i].original_language || "<em>No language specified</em>";
    document.getElementById("show-modal-thumbnail").src = my_movies[i].thumbnail;
    document.getElementById("show-modal-title").querySelector("span").innerHTML = my_movies[i].title || "<em>No title</em>";
    document.getElementById("show-modal-release-date").querySelector("span").innerHTML = my_movies[i].release_date || "<em>No release date</em>";
    document.getElementById("show-modal-overview").querySelector("span").innerHTML = my_movies[i].overview || "<em>No overview available</em>";
    const keywordsElement = document.getElementById("show-modal-keywords");
    keywordsElement.innerHTML = '';

    if (my_movies[i].keywords && my_movies[i].keywords.length > 0) {
        let view = "";
        my_movies[i].keywords.forEach((keyword, i) => {
            view += `<div class="keyword-item">
                    ${keyword} 
                    <button class="add-keyword" data-keyword="${keyword}">Add to my list</button>
                    </div>`;
        });
        keywordsElement.innerHTML = view;
    } else {
        keywordsElement.innerHTML = '<em>No results found</em>';
    }

    document.getElementById("show-modal").style.display = "flex";
}

const resultsModalContr = async (i) => {
    document.getElementById("results-modal-director").querySelector("span").innerHTML = my_results[i].director || "<em>No director specified</em>";
    document.getElementById("results-modal-average-vote").querySelector("span").innerHTML = my_results[i].vote_average || "<em>No average vote</em>";
    document.getElementById("results-modal-original-language").querySelector("span").innerHTML = my_results[i].original_language || "<em>No language specified</em>";
    document.getElementById("results-modal-thumbnail").src = `https://image.tmdb.org/t/p/w200${my_results[i].poster_path}`;
    document.getElementById("results-modal-title").querySelector("span").innerHTML = my_results[i].title || "<em>No title</em>";
    document.getElementById("results-modal-release-date").querySelector("span").innerHTML = my_results[i].release_date || "<em>No release date</em>";
    document.getElementById("results-modal-overview").querySelector("span").innerHTML = my_results[i].overview || "<em>No overview available</em>";
    const keywordsElement = document.getElementById("results-modal-keywords");
    my_results[i].keywords = await keywordsContr(my_results[i].id);
    keywordsElement.innerHTML = '';

    if (my_results[i].keywords && my_results[i].keywords.length > 0) {
        let view = "";
        my_results[i].keywords.forEach((keyword, i) => {
            view += `<div class="keyword-item">
                    ${keyword} 
                    <button class="add-keyword" data-keyword="${keyword}">Add to my list</button>
                    </div>`;
        });
        keywordsElement.innerHTML = view;
    } else {
        keywordsElement.innerHTML = '<em>No results found</em>';
    };

    document.getElementById("results-modal").style.display = "flex";
}

// EVENT ROUTER
const matchEvent = (ev, sel) => ev.target.matches(sel);
const myId = (ev) => Number(ev.target.dataset.myId);

document.addEventListener('click', ev => {
    if      (matchEvent(ev, '.index'))  {
        indexContr  ();
        document.getElementById("edit-modal").style.display = "none";
        document.getElementById("new-modal").style.display = "none";
        document.getElementById("my-keywords-modal").style.display = "none";
    } 
    else if (matchEvent(ev, '.edit'))   editModalContr   (myId(ev));
    else if (matchEvent(ev, '.update')) updateContr (myId(ev));
    // Complete by adding the missing controllers
    else if (matchEvent(ev, '.show')) showModalContr (myId(ev));
    else if (matchEvent(ev, '.new')) newModalContr();
    else if (matchEvent(ev, '.create')) createContr();
    else if (matchEvent(ev, '.delete')) deleteContr (myId(ev));
    else if (matchEvent(ev, '.reset')) resetContr();
    else if (matchEvent(ev, '.search-view')) {
        document.getElementById('movies').innerHTML = resultsView(my_results);
        window.scrollTo(0, 0);
    }
    else if (matchEvent(ev, '.search')) searchContr(document.getElementById('search-query').value);
    else if (matchEvent(ev, '.add-from-api')) addFromAPIContr(my_results[myId(ev)],ev);
    else if (matchEvent(ev, '.add-from-api-image')) document.querySelectorAll('.add-from-api')[myId(ev)].click();
    else if (matchEvent(ev, '.keywords')) resultsModalContr(myId(ev));
    else if (matchEvent(ev, '.add-keyword')) addKeywordToList(ev.target.dataset.keyword);     
    else if (matchEvent(ev, '.my-keywords')) myKeywordsModalContr();
    else if (matchEvent(ev, '.remove-keyword')) removeKeywordContr(ev.target.dataset.keyword);
    else if (matchEvent(ev, '.close')) {
        document.getElementById("show-modal").style.display = "none";
        document.getElementById("edit-modal").style.display = "none";
        document.getElementById("new-modal").style.display = "none";
        document.getElementById("my-keywords-modal").style.display = "none"}
    else if (matchEvent(ev, '.back')) {
        document.getElementById("show-modal").style.display = "none";
        document.getElementById("results-modal").style.display = "none";
        document.getElementById("edit-modal").style.display = "none";
        document.getElementById("new-modal").style.display = "none";
        document.getElementById("my-keywords-modal").style.display = "none"};      
})

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && document.activeElement === document.getElementById("search-query")) {
        event.preventDefault();
        document.getElementById("search-button").click();
    }
});

// Navigation of input fields

const navigationMap = {
    "edit-title": "edit-director",
    "edit-director": "edit-thumbnail",
    "edit-thumbnail": "edit-release-date",
    "edit-release-date": "edit-vote-average",
    "edit-vote-average": "edit-overview",
    "edit-overview": "edit-original-language",
    "edit-original-language": null,
    "new-title": "new-director",
    "new-director": "new-thumbnail",
    "new-thumbnail": "new-release-date",
    "new-release-date": "new-vote-average",
    "new-vote-average": "new-overview",
    "new-overview": "new-original-language",
    "new-original-language": null
};

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        const currentInputId = document.activeElement.id; // Get the current focused input
        const nextInputId = navigationMap[currentInputId]; // Look up the next input in the map

        if (nextInputId) {
            event.preventDefault(); // Prevent default Enter behavior
            document.getElementById(nextInputId).focus(); // Move focus to the next input
        }

        if (currentInputId === "edit-original-language") {
            event.preventDefault();
            document.getElementById("update").click();
        } else if (currentInputId === "new-original-language") {
            event.preventDefault();
            document.getElementById("create").click();
        }

    }
});

window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("show-modal")) {
        document.getElementById("show-modal").style.display = "none";
    }
    if (e.target === document.getElementById("results-modal")) {
        document.getElementById("results-modal").style.display = "none";
    }
    if (e.target === document.getElementById("edit-modal")) {
        document.getElementById("edit-modal").style.display = "none";
    }
    if (e.target === document.getElementById("new-modal")) {
        document.getElementById("new-modal").style.display = "none";
    }
    if (e.target === document.getElementById("my-keywords-modal")) {
        document.getElementById("my-keywords-modal").style.display = "none";
    }
});