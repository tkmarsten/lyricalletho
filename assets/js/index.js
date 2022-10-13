/// This is all just proof of concept and tinkering around with api calls
/// not meant to be merged into the main branch. Just something to reference.

import { Genius, Spotify, YouTube } from './api-helpers.js'

var elements = {
    lyricInput: document.querySelector("#lyricInput"),
    searchButton: document.querySelector("#searchButton"),
    resultsContainer: document.querySelector("#resultsContainer"),
    modalContent: document.querySelector("#modal-content"),
    modal: document.querySelector("#modalEl"),
    modalSpinner: document.querySelector("#modalSpinner"),
    resultsSpinner: document.querySelector("#resultsSpinner")

}

// place to store genius search data to use after the search if needed.
var lastGeniusData;

// setup the api helpers
var genius = new Genius("GXl-jB2YMmbsujcZGKUFVHcIzhsZWf3XidKl02rkhtnwjHoWrwNEK8QqsDn73Oje");
var spotify = new Spotify("3652984d5de34bf48e79cf4623a6d108", "904da68474a34335a798dfef767188ac");
var youtube = new YouTube("AIzaSyCRA7L4j30R8a3PI1FApVqZO1rzVpDN6WI");
spotify.initialize();


// var setInnerHTML = function(elm, html) {
//     elm.innerHTML = html;
//     Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
//       const newScript = document.createElement("script");
//       Array.from(oldScript.attributes)
//         .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
//       newScript.appendChild(document.createTextNode(oldScript.innerHTML));
//       oldScript.parentNode.replaceChild(newScript, oldScript);
//     });
//   }

function onSearchPressed() {
    elements.resultsSpinner.style.display = "inline";
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
        elements.resultsSpinner.style.display = "none";
    });
}

// create an html element to represent the content of one of the genius results
function createResultButton(index, artist, title, imageUrl) {

    var button = document.createElement("div");
    button.className = "flex-auto rounded-[30px] bg-gray-200 h-24 transition ease-in-out hover:scale-110 relative duration-300 hover:z-5";
    button.classList.add("resultButton");

    //set custom data attribute defining what index in the hit results this is
    button.setAttribute("data-genius", index);

    //todo: handle broken images
    var img = document.createElement("img");
    img.className = "flex h-20 w-20 rounded-full border-2 border-black absolute -top-3 -left-5 z-1 bg-black";
    img.setAttribute("src", imageUrl);
    button.appendChild(img);

    var titleh1 = document.createElement("h1");
    titleh1.className = "flex h-8 max-w-[65%] rounded-full m-2 p-1 text-sm truncate ... ml-16";
    titleh1.innerText = `${title}`;
    button.appendChild(titleh1);

    var artisth1 = document.createElement("h1");
    artisth1.className = "h-8 flex rounded-full m-2 p-1 text-sm ml-14 italic";
    artisth1.innerText = `${artist}`;
    button.appendChild(artisth1);

    return button;
}

function onResultsClick(event) {
    // get the hit results index of whatever we clicked
    var hitIndex = event.target.closest("div").getAttribute("data-genius");
    console.log(hitIndex);

    if (!hitIndex) {
        return;
    }
    elements.modalSpinner.style.display = "inline";
    //clear the modal content
    elements.modalContent.innerText = "Loading";
    elements.modal.style.display = "block";
    fetchAndFillModalContent(hitIndex);
}

function fetchAndFillModalContent(hitIndex) {
    var result = lastGeniusData.response.hits[hitIndex].result;
    console.log(result);

    var title = result.title;
    var artist = result.artist_names;
    var geniusId = result.id;
    var geniusUrl = result.url;
    artist = artist.split("(")[0];


    var youtubeDiv = document.createElement("div");
    elements.modalContent.innerHTML = "";

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
        if (data == null || data.tracks.items.length<1){
            var h3 = document.createElement("h3");
            h3.innerText = "(No Spotify Results)";
            elements.modalContent.appendChild(h3);

        }else{
            console.log("got spotify data")
            console.log(data);

            var firstTrack = data.tracks.items[0];
            var iframe = document.createElement("iframe");
            iframe.setAttribute("src", `https://open.spotify.com/embed/track/${firstTrack.id}`)
            iframe.className = "h-40 w-96";
            elements.modalContent.appendChild(iframe);
        }


        // process youtube data
        // var parameters = {
        //     q: `${title} ${artist}`,
        //     part: "snippet",
        //     maxResults: "5"
        // }
        // youtube.get("/search", parameters).then((response) => {
        //     console.log("got youtube response");
        //     console.log(response);
        //     return response.ok ? response.json() : null;
        //     return null;
        // }).then((data) => {

        //     // parse and fill youtube data if the response was good
        //     if (data != null){
        //         console.log("got youtube data");
        //         console.log(data);
        //         youtubeDiv = document.createElement("div");
        //         var id = data.items[0].id.videoId;
        //         var url = `https://www.youtube.com/watch?v=${id}`;
        //         var a = document.createElement("a");
        //         a.setAttribute("href", url);
        //         a.setAttribute("target", "_blank");
        //         a.innerHTML = `Watch on <span class='text-red-500'>YouTube</span>`;
        //         youtubeDiv.appendChild(a);
        //         elements.modalContent.appendChild(youtubeDiv);
        //     }else{
        //         var h3 = document.createElement("h3");
        //         h3.innerText = "(YouTube Quota Exceeded)";
        //         elements.modalContent.appendChild(h3);
        //     }

        //     var a = document.createElement("a");
        //     a.setAttribute("target", "_blank");
        //     a.setAttribute("ahref", geniusUrl);
        //     a.innerHTML = 'View lyrics on <span class="text-amber-500">Genius</span>';
        //     elements.modalContent.appendChild(a);
        //     elements.modalSpinner.style.display = "none";
            
        // })
        
        // youtube thumbnail url = "items[0].snippet.thumbnails.default"
        // temporary youtube link so we dont spam our endpoint quota
        var a = document.createElement("a");
        a.setAttribute("href", "http://www.youtube.com");
        a.setAttribute("target", "_blank");
        a.className ="flex justify-center items-center relative";
        var img = document.createElement("img");
        img.setAttribute("src", "https://i.ytimg.com/vi/FAO8ZAUBx0c/default.jpg");
        img.className = "rounded-[8px]"
        var playImg = document.createElement("img");
        playImg.setAttribute("src", "./assets/images/playButton.png");
        playImg.className = "absolute w-9";

        //a.innerHTML = `Watch on <span class='text-red-500'>YouTube</span>`;
        a.appendChild(img);
        a.appendChild(playImg);
        youtubeDiv.appendChild(a);
        elements.modalContent.appendChild(youtubeDiv);

        // lyrics link
        var a = document.createElement("a");
        a.setAttribute("target", "_blank");
        a.setAttribute("href", geniusUrl);
        a.innerHTML = 'View lyrics on <span class="text-amber-500">Genius</span>';
        elements.modalContent.appendChild(a);

        // hide the spinner
        elements.modalSpinner.style.display = "none";
    });
}

//search press
elements.searchButton.addEventListener("click", onSearchPressed);

//catchall for genius results
elements.resultsContainer.addEventListener("click", onResultsClick);

let closeButton = document.getElementById('close-button')

closeButton.addEventListener('click', function () {
    elements.modal.style.display = 'none'
    elements.modalContent.innerHTML = ""; // clear this on close so iframe is removed and spotify doesn't keep playing music
})