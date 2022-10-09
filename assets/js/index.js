import{ Genius, Spotify, YouTube } from './api-helpers.js'

var elements = {
    lyricInput: document.querySelector("#lyricInput"),
    searchButton: document.querySelector("#searchButton"),
    resultsContainer: document.querySelector("#resultsContainer"),
    bottomBox: document.querySelector("#bottomBox")
}

var lastGeniusData;
var genius = new Genius("GXl-jB2YMmbsujcZGKUFVHcIzhsZWf3XidKl02rkhtnwjHoWrwNEK8QqsDn73Oje");

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
    var div = document.createElement("div");
    div.setAttribute("class", "border-2 h-20");
    div.setAttribute("data-geniusHitIndex", index);
    
    var p1 = document.createElement("p");
    p1.innerText = artist;

    var p2 = document.createElement("p");
    p2.innerText = song;

    div.appendChild(p1);
    div.appendChild(p2);

    return div;
}



elements.searchButton.addEventListener("click", onSearchPressed);