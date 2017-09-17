const ROOT_KEY = 'cms_data_config',
      FIREBASE_KEY = 'firebase_url',
      DIRECTORY_KEY = 'data_directory',
      DATA_FILENAME = 'data.json';

const fs = require('fs-extra'),
      curl = require('curl'),
      config = require('./package.json')[ROOT_KEY],
      path = require('path');
      

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

function fetchFromFirebase() {
   return "ginjerogijrgoij";
}

function cacheExists() {  
   return fs.existsSync(dataPath);
}

function fetchFromFirebase(createCache) {
   return new Promise((resolve, reject) => {
      curl.get(config[FIREBASE_KEY] + '.json', {}, (err, response, body) => {
         if (err) reject(err);
         if (createCache) writeToCache(body);
         resolve(body);
      });
   });
}

function loadLocalCache() {
   return new Promise((resolve, reject) => {
      fs.readFile(dataPath, 'utf-8', (err, data) => {
         if (err) reject(err);

         resolve(data);
      });
   });
}

function writeToCache(body) {
   const json = JSON.parse(body);
   fs.writeFile(dataPath, JSON.stringify(json, null, 3), (err) => {
      if (err) throw err;
   });
}
