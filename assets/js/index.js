/// This is all just proof of concept and tinkering around with api calls
/// not meant to be merged into the main branch. Just something to reference.

import { Genius, Spotify, YouTube } from './api-helpers.js'

var elements = {
    lyricInput: document.querySelector("#lyricInput"),
    searchButton: document.querySelector("#searchButton"),
    resultsContainer: document.querySelector("#resultsContainer"),
    modalContent: document.querySelector("#modal-content"),
    modal: document.querySelector("#modalEl")
}

// place to store genius search data to use after the search if needed.
var lastGeniusData;

// setup the api helpers
var genius = new Genius("GXl-jB2YMmbsujcZGKUFVHcIzhsZWf3XidKl02rkhtnwjHoWrwNEK8QqsDn73Oje");
var spotify = new Spotify("3652984d5de34bf48e79cf4623a6d108", "904da68474a34335a798dfef767188ac");
var youtube = new YouTube("AIzaSyCRA7L4j30R8a3PI1FApVqZO1rzVpDN6WI");
spotify.initialize();


function onSearchPressed() {
    var input = elements.lyricInput.value;
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
    });
}

// create an html element to represent the content of one of the genius results
function createResultButton(index, artist, title, imageUrl) {

    var button = document.createElement("div");
    button.className = "flex-auto border-4 rounded-[30px] h-24 transition ease-in-out delay-150 hover:scale-110 relative duration-300 hover:z-20";
    button.classList.add("resultButton");

    //set custom data attribute defining what index in the hit results this is
    button.setAttribute("data-genius", index);

    //todo: handle broken images
    var img = document.createElement("img");
    img.className = "flex h-20 w-20 rounded-full border-2 border-black absolute -top-3 -left-5 z-1 bg-black";
    img.setAttribute("src", imageUrl);
    button.appendChild(img);

    var artisth1 = document.createElement("h1");
    artisth1.className = "flex h-8 max-w-[65%] rounded-full border-2 border-black m-2 p-1 text-sm truncate ... ml-16";
    artisth1.innerText = `Artist - ${artist}`;
    button.appendChild(artisth1);

    var titleh1 = document.createElement("h1");
    titleh1.className = "h-8 flex rounded-full border-2 border-black m-2 p-1 text-sm ml-14";
    titleh1.innerText = `Title - ${title}`;
    button.appendChild(titleh1);

    return button;
}

function onResultsClick(event) {
    // get the hit results index of whatever we clicked
    var hitIndex = event.target.closest("div").getAttribute("data-genius");
    console.log(hitIndex);

    if (!hitIndex) {
        return;
    }
    //clear the modal content
    elements.modalContent.innerText = "Loading";
    elements.modal.style.display = "block";
    fetchAndFillModalContent(hitIndex);
}

function fetchAndFillModalContent(hitIndex){
    var result = lastGeniusData.response.hits[hitIndex].result;
    console.log(result);

    var title = result.title;
    var artist = result.artist_names;

    var spotifyDiv = document.createElement("div");
    var youtubeDiv = document.createElement("div");

    // start off getting spotify data
    var parameters = {
        q: `track:${title} artist:${artist}`,
        type: 'track'
    }
    spotify.get("/search", parameters).then((response) => {
        console.log("got spotify response");
        console.log(response);
        return response.json();
        }).then((data) => {
            console.log("got spotify data")
            console.log(data);
            //clear modal and add a spotify iframe
            elements.modalContent.innerHTML = "";
            var firstTrack = data.tracks.items[0];
            var iframe = document.createElement("iframe");
            iframe.setAttribute("src", `https://open.spotify.com/embed/track/${firstTrack.id}`)
            spotifyDiv.appendChild(iframe);
            elements.modalContent.appendChild(spotifyDiv);

            // process youtube data
            var parameters = {
                q: `${title} ${artist}`,
                part: "snippet",
                maxResults: "5"
            }
            youtube.get("/search", parameters).then((response) => {
                console.log("got youtube response");
                console.log(response);
                return response.json();
            }).then((data) => {
                console.log("got youtube data");
                console.log(data);
                var youtubeDiv = document.createElement("div");
                var id = data.items[0].id.videoId;
                var url = `https://www.youtube.com/watch?v=${id}`;
                var a = document.createElement("a");
                a.setAttribute("href", url);
                a.setAttribute("target", "_blank");
                a.innerHTML = "Watch on YouTube";
                youtubeDiv.appendChild(a);
                elements.modalContent.appendChild(youtubeDiv);
            })
    });



    searchYoutube(result.title, result.artist_names);
}


// this probably isn't needed at all, but it's where i threw in setting the iframe source, so here it is.
function loadCoverAndLink(data) {
    var firstTrack = data.tracks.items[0];
    var albumCover = firstTrack.album.images[1].url;
    var link = firstTrack.external_urls.spotify;
    document.querySelector("#iFrame").setAttribute("src", `https://open.spotify.com/embed/track/${firstTrack.id}`);

    var a = document.createElement("a");
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");

    var img = document.createElement("img");
    img.setAttribute("src", albumCover);

    a.appendChild(img);

    elements.bottomBox.innerHTML = "";
    elements.bottomBox.appendChild(a);
}

function searchYoutube(song, artist) {

}

//search press
elements.searchButton.addEventListener("click", onSearchPressed);

//catchall for genius results
elements.resultsContainer.addEventListener("click", onResultsClick);