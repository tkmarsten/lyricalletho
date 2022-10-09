//todo: Access-Tokens only last for an hour. Not neccessary for this project, but could implement token renwal on expiration.

/**
 * Custom wrapper for spotify api calls. Construct it with your id/secret.
 * Invoke initialize for it to grab the access token. Once it has the access token
 * you can use get() or rawGet() methods to return a fetch promise.
 */
 class Spotify {
    constructor(clientId, clientSecret){
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._baseUrl = 'https://api.spotify.com/v1';
    }

    /** Just fetches the access-token, with the option of a callback on completion.
     * This is required to use the get methods.
    */
    async initialize(callback){
        this._token = await this._getToken();
        if (callback){
            callback();
        }
        
    }

    /** only  */
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
     * @param {Object} options the options - dependent on the endpoint
     * @returns A fetch promise
     */
    get(endpoint, options){
        var final = this._buildUrl(endpoint, options);
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
