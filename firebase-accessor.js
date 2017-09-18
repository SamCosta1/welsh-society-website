const ROOT_KEY = 'cms_data_config';
const fs = require('fs-extra'),
      curl = require('curl'),
      config = require('./package.json')[ROOT_KEY],
      url = require('url'),
      path = require('path');

const FIREBASE_KEY = 'firebase_url',
      DATA_ENDPOINT_KEY = 'firebase_data_endpoint',
      DIRECTORY_KEY = 'data_directory',
      DATA_FILENAME = 'data.json',
      FIREBASE_ACCESS_TOKEN_KEY = 'access-key-file',
      FIREBASE_ENDPOINT = url.resolve(config[FIREBASE_KEY], config[DATA_ENDPOINT_KEY]) + '.json';

if (config === null  || config === undefined
                     || !config.hasOwnProperty(FIREBASE_KEY)
                     || !config.hasOwnProperty(DIRECTORY_KEY)) {
   throw `Missing information, please ensure your package json contains the following attributes
   "${ROOT_KEY}": {
      "${FIREBASE_KEY}": "<your firebase url>",
      "${DIRECTORY_KEY}": "<directory to save data e.g ./dist>"
   }`;

   return;
}

const dataPath = path.format({
         dir: config[DIRECTORY_KEY],
         base: DATA_FILENAME
      }).toString();

module.exports.getData = (discardCache = false, createCache = true) => {   
   if (discardCache || !cacheExists()) {
      return fetchFromFirebase(createCache);
   } else {
      return loadLocalCache();
   }
}

module.exports.pushLocalToFirebase = () => {
   var accessToken;
   try {
      accessToken = require('./' + config[FIREBASE_ACCESS_TOKEN_KEY]);

   } catch (e) {
      throw 'No access key found, generate a private key in firebase and store it in your project root in a file called ' +
         config[FIREBASE_ACCESS_TOKEN_KEY];
   }

   loadLocalCache().then(data => {
      curl.put(FIREBASE_ENDPOINT, JSON.stringify(data), (err, response, body) => {
         console.log(body);
      });
   }).catch(err => { throw err });
}

function fetchFromFirebase() {
   return "ginjerogijrgoij";
}

function cacheExists() {  
   return fs.existsSync(dataPath);
}

function fetchFromFirebase(createCache) {
   return new Promise((resolve, reject) => {

      curl.get(FIREBASE_ENDPOINT, {}, (err, response, body) => {
         if (err) reject(err);
         body = JSON.parse(body);
         if (createCache) writeToCache(body);
         resolve(body);
      });
   });
}

function loadLocalCache() {
   return new Promise((resolve, reject) => {
         console.log(dataPath);
      fs.readFile(dataPath, 'utf-8', (err, data) => {
         if (err) reject(err);

         resolve(JSON.parse(data));
      });
   });
}

function writeToCache(body) {
   fs.writeFile(dataPath, JSON.stringify(body, null, 3), (err) => {
      if (err) throw err;
   });
}
