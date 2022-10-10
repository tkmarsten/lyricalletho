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

            var div = createResultButton(i, hit.artist_names, hit.title, hit.song_art_image_thumbnail_url);

            elements.resultsContainer.appendChild(div);
        }
    });
}

function createResultButton(index, artist, title, imageUrl){
    var button = document.createElement("button");
    button.setAttribute("class", "flex border-2");
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

function onResultsClick(event){
    var hitIndex = event.target.closest("button").getAttribute("data-genius");
    console.log(hitIndex);

    if (!hitIndex){
        return;
    }

    var result = lastGeniusData.response.hits[hitIndex].result;
    console.log (result);
    
    var parameters = {
        q: `track:${result.title} artist:${result.artist_names}`,
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



elements.searchButton.addEventListener("click", onSearchPressed);
elements.resultsContainer.addEventListener("click", onResultsClick);