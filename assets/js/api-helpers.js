/**
 *  Custom wrapper for Genius API calls. Construct it with an access token.
 * No need for access token fetching since you're passing it in directly.
 * You can use get() or rawGet() methods to return a fetch promise.
 */
 export class Genius{
    constructor(accessToken){
        this._accessToken = accessToken;
        this._baseUrl = "https://api.genius.com";
    }

    /**
     * Maket a GET request with a raw path (it will include the access token automatically)
     * @param {String} path raw string past the base url: 'https://api.genius.com'
     * @returns A fetch promise
     */
    rawGet(path){
        return fetch(this._baseUrl + path + `access_token=${this._accessToken}`);
    }

    /**
     * Make a GET request to the endpoint including, if any, options.
     * ex: endpoint: "/search"
     * ex: parameters: {q: "I'm a genie in a bottle"}
     * @param {String} endpoint the endpoint - required
     * @param {Object} parameters the query parameters - dependent on the endpoint
     * @returns A fetch promise
     */
    get(endpoint, parameters){
        var final = this._buildUrl(endpoint, parameters);
        return this.rawGet(final);
    }

    _buildUrl = function (url, parameters) {
        var qs = '';
        for (var key in parameters) {
          if (parameters.hasOwnProperty(key)) {
            var value = parameters[key];
            qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
          }
        }
        return url + '?' + qs;
      };
}

/**
 *  Custom wrapper for YouTube API calls. Construct it with an api key.
 * You can use get() or rawGet() methods to return a fetch promise.
 */
export class YouTube{
    constructor(apiKey){
        this._apiKey = apiKey;
        this._baseUrl = "https://www.googleapis.com/youtube/v3";
    }

    /**
     * Maket a GET request with a raw path (it will include the api key automatically)
     * @param {String} path raw string past the base url: 'https://www.googleapis.com/youtube/v3'
     * @returns A fetch promise
     */
    getRaw(path){
        return fetch(this._baseUrl + path + `key=${this._apiKey}`)
    }

    /**
     * Make a GET request to the endpoint including, if any, parameters.
     * ex: endpoint: "/search"
     * ex: parameters: {q: "cat videos", part: "snippet", maxResults: "20"}
     * @param {String} endpoint the endpoint - required
     * @param {Object} parameters the query parameters - dependent on the endpoint
     * @returns A fetch promise
     */
    get(endpoint, parameters){
        var final = this._buildUrl(endpoint, parameters);
        return this.getRaw(final);
    }

    _buildUrl = function (url, parameters) {
        var qs = '';
        for (var key in parameters) {
          if (parameters.hasOwnProperty(key)) {
            var value = parameters[key];
            qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
          }
        }
        return url + "?" + qs;
      };
}

/**
 * Custom wrapper for Spotify API calls. Construct it with your id/secret.
 * Invoke initialize for it to grab the access token. Once it has the access token
 * you can use get() or rawGet() methods to return a fetch promise.
 */
export class Spotify {
    
    constructor(clientId, clientSecret){
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._baseUrl = 'https://api.spotify.com/v1';
    }

    //todo: Access-Tokens only last for an hour. Not neccessary for this project, but could implement token renwal on expiration.
    /** Just fetches the access-token, with the option of a callback on completion.
     * This is required to use the get methods.
    */
    async initialize(callback){
        this._token = await this._getToken();
        if (callback){
            callback();
        }
        
    }

    async _getToken(){
        var options = {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(this._clientId + ':' + this._clientSecret)
            },
            body: 'grant_type=client_credentials'
        };
    
        var result = await fetch('https://accounts.spotify.com/api/token', options);
    
        var data = await result.json();
        
        return data.access_token;
    }

    /**
     * Maket a GET request with a raw path
     * @param {String} path raw string past the base url: 'https://api.spotify.com/v1'
     * @returns A fetch promise
     */
    rawGet(path){
        var options = {
            method: 'GET',
            headers:{
                'Authorization' : 'Bearer ' + this._token
            }
        }

        return fetch(this._baseUrl + path, options);
    }

    /**
     * Make a GET request to the endpoint including, if any, options.
     * ex: endpoint: "/artists/{id}/top-tracks"
     * ex: options: {q: "pink floyd", type: ["artist", "album"]}
     * @param {String} endpoint the endpoint - required
     * @param {Object} parameters the query parameters - dependent on the endpoint
     * @returns A fetch promise
     */
    get(endpoint, parameters){
        var final = this._buildUrl(endpoint, parameters);
        return this.rawGet(final)
    }

    _buildUrl = function (url, parameters) {
        var qs = '';
        for (var key in parameters) {
          if (parameters.hasOwnProperty(key)) {
            var value = parameters[key];
            qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
          }
        }
        if (qs.length > 0) {
          // chop off last '&'
          qs = qs.substring(0, qs.length - 1);
          url = url + '?' + qs;
        }
        return url;
      };
}
