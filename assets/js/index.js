import{ Genius, Spotify, YouTube } from './api-helpers.js'

var elements = {
    lyricInput: document.querySelector("#lyricInput"),
    searchButton: document.querySelector("#searchButton"),
    resultsContainer: document.querySelector("#resultsContainer"),
    bottomBox: document.querySelector("#bottomBox")
}

var lastGeniusData;
var genius = new Genius("GXl-jB2YMmbsujcZGKUFVHcIzhsZWf3XidKl02rkhtnwjHoWrwNEK8QqsDn73Oje");
var spotify = new Spotify("3652984d5de34bf48e79cf4623a6d108", "904da68474a34335a798dfef767188ac");
spotify.initialize();

function onSearchPressed(){
    var input = elements.lyricInput.value;
    var parameters = {
        q: input
    }
    genius.get("/search", parameters).then((response)=>{
        console.log(response);
        return response.json();
    }).then((data)=>{
        console.log(data);
        lastGeniusData = data;
        elements.resultsContainer.innerHTML = "";


        for(let i = 0; i < data.response.hits.length; i++){
            var hit = data.response.hits[i].result;

            var div = createResultDiv(i, hit.artist_names, hit.title);

            elements.resultsContainer.appendChild(div);
        }


    });
}

function createResultDiv(index, artist, song){
    var div = document.createElement("button");
    div.setAttribute("class", "border-2 h-20 bg-orange-400 pointer-events-auto");
    div.setAttribute("data-genius", index);
    div.innerText = `${song} - ${artist}`
    // var p1 = document.createElement("p");
    // p1.innerText = artist;

    // var p2 = document.createElement("p");
    // p2.innerText = song;

    // div.appendChild(p1);
    // div.appendChild(p2);

    return div;
}

function onResultsClick(event){
    var hitIndex = event.target.getAttribute("data-genius");
    console.log(hitIndex);

    if (!hitIndex){
        return;
    }

    var result = lastGeniusData.response.hits[hitIndex].result;
    console.log (result);

    var parameters = {
        q: `${result.title}`,
        type: 'track'
    }
    spotify.get("/search", parameters).then((response)=>{
        console.log(response);
        return response.json();
    }).then((data)=>{
        console.log(data);
        loadCoverAndLink(data);
    })

}

function loadCoverAndLink(data){
    var firstTrack = data.tracks.items[0];
    var albumCover = firstTrack.album.images[1].url;
    var link = firstTrack.external_urls.spotify;

    var a = document.createElement("a");
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");
    
    var img = document.createElement("img");
    img.setAttribute("src", albumCover);
    
    a.appendChild(img);

    elements.bottomBox.innerHTML = "";
    elements.bottomBox.appendChild(a);
}

elements.searchButton.addEventListener("click", onSearchPressed);
elements.resultsContainer.addEventListener("click", onResultsClick);