/// This is all just proof of concept and tinkering around with api calls
/// not meant to be merged into the main branch. Just something to reference.

import { Genius, Spotify, YouTube } from './api-helpers.js'

var elements = {
    lyricInput: document.querySelector("#lyricInput"),
    searchButton: document.querySelector("#searchButton"),
    resultsContainer: document.querySelector("#resultsContainer"),
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
    var button = document.createElement("button");
    button.setAttribute("class", "flex border-2");

    //set custom data attribute defining what index in the hit results this is
    button.setAttribute("data-genius", index);

    //todo: handle broken images
    var img = document.createElement("img");
    img.setAttribute("src", imageUrl);
    img.className = "flex-shrink h-20";
    button.appendChild(img);

    var textDiv = document.createElement("div");

    var titleh1 = document.createElement("h1");
    titleh1.innerText = `Title - ${title}`;
    textDiv.appendChild(titleh1);

    var artisth1 = document.createElement("h1");
    artisth1.innerText = `Artist - ${artist}`;
    textDiv.appendChild(artisth1);

    button.appendChild(textDiv);
    return button;
}


function onResultsClick(event) {
    // get the hit results index of whatever we clicked
    var hitIndex = event.target.closest("button").getAttribute("data-genius");
    console.log(hitIndex);

    if (!hitIndex) {
        return;
    }

    // grab the result at whatever index it was
    var result = lastGeniusData.response.hits[hitIndex].result;
    console.log(result);


    // search spotify based on track and artist
    var parameters = {
        q: `track:${result.title} artist:${result.artist_names}`,
        type: 'track'
    }
    spotify.get("/search", parameters).then((response) => {
        console.log(response);
        return response.json();
    }).then((data) => {
        console.log(data);
        loadCoverAndLink(data);
    })

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
    var parameters = {
        q: `${song} ${artist}`,
        part: "snippet",
        maxResults: "20"
    }
    youtube.get("/search", parameters).then((response) => {
        console.log(response);
        return response.json();
    }).then((data) => {
        console.log(data);
    })
}

//search press
elements.searchButton.addEventListener("click", onSearchPressed);

//catchall for genius results
elements.resultsContainer.addEventListener("click", onResultsClick);