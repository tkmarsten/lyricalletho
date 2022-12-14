import { Genius, Spotify, YouTube } from './api-helpers.js'

// Just an object to store static elements on the page (personal preference to keep me organized)
var elements = {
    lyricInput: document.querySelector("#lyricInput"),
    searchButton: document.querySelector("#searchButton"),
    resultsContainer: document.querySelector("#resultsContainer"),
    modalContent: document.querySelector("#modal-content"),
    modal: document.querySelector("#modalEl"),
    modalSpinner: document.querySelector("#modalSpinner"),
    resultsSpinner: document.querySelector("#resultsSpinner"),
    favoritesPanel: document.querySelector("#favoritesPanel"),
    favoritesButton: document.querySelector("#favoritesButton"),
    favoritesContent: document.querySelector("#favoritesContent"),
    favoritesCloseButton: document.querySelector("#favoritesClose"),
    favoritesModal: document.querySelector("#favoritesModal"),
    paragraph: document.querySelector("#paragraph")
}

// Place to store genius search data to use after the search if needed.
var lastGeniusData;

// Setup the api helpers (I know these are overkill since we're only making one call for each,
// but they were fun to make, and keeps the code here a little cleaner)
var genius = new Genius("GXl-jB2YMmbsujcZGKUFVHcIzhsZWf3XidKl02rkhtnwjHoWrwNEK8QqsDn73Oje");
var spotify = new Spotify("3652984d5de34bf48e79cf4623a6d108", "904da68474a34335a798dfef767188ac");
var youtube = new YouTube("AIzaSyCRA7L4j30R8a3PI1FApVqZO1rzVpDN6WI");
spotify.initialize();

/** When the search button is pressed, we are using the /search
 * endpoint from the genius api and creating elements to represent
 * each hit, clearing the results container and adding the new elements to the container.
 */
function onSearchPressed() {
    var input = elements.lyricInput.value; // our search value from the input
    if (!input){
        return;
    }
    elements.resultsSpinner.style.display = "inline"; //get that spinner going!
    elements.paragraph.classList.add("hidden");
    

    var parameters = {
        q: input
    }
    genius.get("/search", parameters).then((response) => {
        console.log(response);
        return response.json();
    }).then((data) => {
        console.log(data);
        lastGeniusData = data;

        // clear the container
        elements.resultsContainer.innerHTML = "";

        // loop through the genius data, creating/appending a related button/html element to the container
        for (let i = 0; i < data.response.hits.length; i++) {
            var hit = data.response.hits[i].result;

            //todo: probably be better to just pass in just the hit object instead of a bunch of parameters, and let the create function take care of it
            var div = createResultButton(i, hit.artist_names, hit.title, hit.song_art_image_thumbnail_url);
            elements.resultsContainer.appendChild(div);
        }
        elements.resultsSpinner.style.display = "none";
    });
}

/** Create and return an html element to represent the content of one of the genius results*/
function createResultButton(index, artist, title, imageUrl) {

    // the main div
    var button = document.createElement("div");
    button.className = "flex-auto bg-tertiary rounded-[30px] h-32 transition ease-out hover:scale-110 duration-300 relative hover:z-20";
    button.classList.add("resultButton");

    // set custom data attribute defining what index in the hit results this is (this is used to retrieve the stored data)
    button.setAttribute("data-genius", index);

    //todo: handle broken images
    //the album thumbnail
    var img = document.createElement("img");
    img.className = "flex h-24 w-24 rounded-full border-4 border-black absolute -top-6 -left-10 bg-quaternary";
    img.setAttribute("src", imageUrl);
    button.appendChild(img);

    //the title
    var titleh1 = document.createElement("h1");
    titleh1.className = "flex-auto h-12 ml-16 rounded-full m-2 p-3 text-xl truncate ...";
    titleh1.innerText = `${title}`;
    button.appendChild(titleh1);

    //the artist
    var artisth1 = document.createElement("h1");
    artisth1.className = "flex-auto h-12 ml-8 rounded-full m-2 p-3 text-lg truncate ... italic";
    artisth1.innerText = `- ${artist}`;
    button.appendChild(artisth1);

    return button;
}

/** Checks if a search result was clicked, if so pull up the modal and fill it */
function onResultsClick(event) {
    // get the hit results index of whatever we clicked
    var hitIndex = event.target.closest("div").getAttribute("data-genius");
    console.log(hitIndex);

    if (!hitIndex) {
        return;
    }
    elements.modalSpinner.classList.remove("hidden");
    //clear the modal content
    elements.modalContent.innerText = "Loading";
    elements.modal.style.display = "block";
    fetchAndFillModalContent(hitIndex);
}

/** Fetches data from the locally stored genius data, by index,
 *  then we can use that data to fetch from spotify and youtube.
 * Creates html elements based on the data, and appends it to the modal's content
 */
function fetchAndFillModalContent(hitIndex) {
    var result = lastGeniusData.response.hits[hitIndex].result;
    console.log(result);

    var title = result.title;
    var artist = result.artist_names;
    var geniusId = result.id;
    var geniusUrl = result.url;
    artist = artist.split("(")[0];
    
    // make sure modal content is cleared
    elements.modalContent.innerHTML = "";

    var a = document.createElement("a");
    a.setAttribute("target", "_blank");
    a.setAttribute("href", geniusUrl);
    a.innerHTML = 'View lyrics on <span class="text-amber-500">Genius</span>';
    elements.modalContent.appendChild(a);

    getAndRenderSpotifyResults(title, artist);
    getAndRenderYoutubeResults(title, artist);
}

/** Fetch spotify results based on title and artist from genius and
 * render the the first result to the modal-content container
 */
function getAndRenderSpotifyResults(title, artist){
    // start off getting spotify data
    var parameters = {
        q: `track:${title} artist:${artist}`,
        type: 'track'
    }
    spotify.get("/search", parameters).then((response) => {
        console.log("got spotify response");
        console.log(response);
        return response.ok ? response.json() : null;
        }).then((data) => {

            // parse and fill spotify data if the response was good
            if (data == null || data.tracks.items.length < 1) {
                var h3 = document.createElement("h3");
                h3.innerText = "(No Spotify Results)";
                elements.modalContent.appendChild(h3);

            } else {
                console.log("got spotify data")
                console.log(data);
                var spotifyDiv = document.createElement("div");
                spotifyDiv.className="flex items-center";

                var firstTrack = data.tracks.items[0];
                var iframe = document.createElement("iframe");
                iframe.setAttribute("src", `https://open.spotify.com/embed/track/${firstTrack.id}`)
                iframe.className = "h-40 w-[300px]";
                spotifyDiv.appendChild(iframe);

                var starDiv = document.createElement("div");
                starDiv.className = "relative";

                var checkbox = document.createElement("input");
                checkbox.className="ml-2 star";
                checkbox.setAttribute("type", "checkbox");
                checkbox.checked = getFavorites().includes(firstTrack.id);
                checkbox.addEventListener("change", (event)=>{
                    if (event.target.checked){
                        saveToFavorites(firstTrack.id);
                    }else{
                        removeFromFavorites(firstTrack.id)
                    }
                });
                starDiv.appendChild(checkbox);
                spotifyDiv.appendChild(starDiv);
                elements.modalContent.appendChild(spotifyDiv);
            }
            
            elements.modalSpinner.style.display = "none";
        });
}

/** Fetch you results based on title and artist from genius and
 * render the the first result to the modal-content container
 */
function getAndRenderYoutubeResults(title, artist){

    var youtubeDiv = document.createElement("div");
    // process youtube data
    var parameters = {
        q: `${title} ${artist}`,
        part: "snippet",
        maxResults: "5"
    }
    youtube.get("/search", parameters).then((response) => {
        console.log("got youtube response");
        console.log(response);
        return response.ok ? response.json() : null;
    }).then((data) => {

        // parse and fill youtube data if the response was good
        if (data != null){
            console.log("got youtube data");
            console.log(data);
            youtubeDiv = document.createElement("div");
            var id = data.items[0].id.videoId;
            var url = `https://www.youtube.com/watch?v=${id}`;

            var a = document.createElement("a");
            a.setAttribute("href", url);
            a.setAttribute("target", "_blank");
            a.className = "flex justify-center items-center relative";
            var img = document.createElement("img");
            img.setAttribute("src", data.items[0].snippet.thumbnails.medium.url);
            img.className = "rounded-[8px]"
            var playImg = document.createElement("img");
            playImg.setAttribute("src", "./assets/images/playbutton.png");
            playImg.className = "absolute w-16";
    
            //a.innerHTML = `Watch on <span class='text-red-500'>YouTube</span>`;
            a.appendChild(img);
            a.appendChild(playImg);
            youtubeDiv.appendChild(a);
            elements.modalContent.appendChild(youtubeDiv);
        }else{
            var h3 = document.createElement("h3");
            h3.innerText = "(YouTube Quota Exceeded)";
            elements.modalContent.appendChild(h3);
        }

    })
}

// callback for when the favorites button is clicked
function onFavoritesClick(){

    elements.favoritesModal.classList.remove("hidden");
    var favorites = getFavorites();
    if (favorites.length > 0){
        favorites.forEach((fav)=>{
            var spotifyDiv = document.createElement("div");
            spotifyDiv.className = "flex items-center";

            var iframe = document.createElement("iframe");
            iframe.setAttribute("src", `https://open.spotify.com/embed/track/${fav}`)
            iframe.className = "h-24";
            spotifyDiv.appendChild(iframe);

            var xButton = document.createElement("button");
            xButton.innerText = "X";
            xButton.className = "ml-2 text-red-500";
            xButton.addEventListener("click", (event)=>{
                    removeFromFavorites(fav);
                    spotifyDiv.remove();
                    if (elements.favoritesContent.children.length == 0){
                        var p = document.createElement("p");
                        p.innerText = "No Favorites."
                        elements.favoritesContent.appendChild(p);
                    }
            });

            spotifyDiv.appendChild(xButton);
            elements.favoritesContent.appendChild(spotifyDiv);
        })
    }else{
        var p = document.createElement("p");
        p.innerText = "No Favorites";
        elements.favoritesContent.appendChild(p);
    }
    
}

// call back for when favorites modal is closed
function onFavoritesClose(){
    elements.favoritesContent.innerHTML = "";
    elements.favoritesModal.classList.add("hidden");
}

// saving to favorites on star checked
function saveToFavorites(url){
    var favorites = getFavorites();
    favorites.unshift(url);
    if (favorites.length>5){
        favorites.pop();
    }
    localStorage.setItem("spotifyFavorites", JSON.stringify(favorites));
}

// removing from favorites
function removeFromFavorites(url){
    var favorites = getFavorites();
    var index = -1;
    for(var i = 0; i < favorites.length; i++){
        if (favorites[i] == url){
            index = i;
        }
    }
    if (index >=0){
        favorites.splice(index,1);
        localStorage.setItem("spotifyFavorites", JSON.stringify(favorites));
    }

}

// shortcut to get a favorites array from storage
function getFavorites(){
    var favorites = JSON.parse(localStorage.getItem("spotifyFavorites"));
    return favorites ? favorites : [];
}

// on search pressed
elements.searchButton.addEventListener("click", onSearchPressed);

// catchall for clicks on genius results
elements.resultsContainer.addEventListener("click", onResultsClick);

// on modal closed 
document.getElementById('close-button').addEventListener('click', function () {
    elements.modal.style.display = 'none'
    elements.modalContent.innerHTML = ""; // clear this on close so iframe is removed and spotify doesn't keep playing music
})

// on favorites click
elements.favoritesButton.addEventListener("click", onFavoritesClick);

// on favorites close click
elements.favoritesCloseButton.addEventListener("click", onFavoritesClose);

// prevent default on search submitted
document.querySelector('.search-form').addEventListener('submit', function (event) {
    event.preventDefault()
})
