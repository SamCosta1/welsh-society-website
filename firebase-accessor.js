const ROOT_KEY = 'cms_data_config';
const fs = require('fs-extra'),
   firebase = require('firebase'),
   config = require('./package.json')[ROOT_KEY],
   url = require('url'),
   path = require('path');

const DATA_ENDPOINT_KEY = 'firebase_data_endpoint',
   DIRECTORY_KEY = 'data_directory',
   DATA_FILENAME = 'data.json',
   FIREBASE_ACCESS_TOKEN_KEY = 'firebase_access_key_file',
   FIREBASE_CONFIG_KEY = 'firebase_config_file',
   FIREBASE_SITEDATA_ENDPOINT = config[DATA_ENDPOINT_KEY];

if (config === null || config === undefined
   || !config.hasOwnProperty(FIREBASE_ACCESS_TOKEN_KEY)
   || !config.hasOwnProperty(FIREBASE_CONFIG_KEY)
   || !config.hasOwnProperty(DIRECTORY_KEY)) {
   throw `Missing information, please ensure your package json contains the following attributes
   "${ROOT_KEY}": {
         "${FIREBASE_CONFIG_KEY}": "<directory to save data e.g ./dist>",
      "${FIREBASE_ACCESS_TOKEN_KEY}": "<directory to save data e.g ./dist>",
      "${DIRECTORY_KEY}": "<directory to save data e.g ./dist>"
   }`;

   return;
}

const dataPath = path.format({
   dir: config[DIRECTORY_KEY],
   base: DATA_FILENAME
}).toString();

module.exports.getDataPath = () => {
   return dataPath;
};


module.exports.getData = (discardCache = false, createCache = true) => {
   if (discardCache || !cacheExists()) {
      return fetchFromFirebase(createCache);
   } else {
      return loadLocalCache();
   }
};

module.exports.pushLocalToFirebase = () => {
   initFirebase();
   authenticateFirebase().then(() => {
      loadLocalCache().then(data => {
         firebase.database().ref(FIREBASE_SITEDATA_ENDPOINT).set(data)
            .then(() => {
               process.exit()
            })
            .catch(err => {
               throw err;
            });
      }).catch(err => {
         throw err
      });
   });
};

function initFirebase() {
   const firebaseConfig = require(config[FIREBASE_CONFIG_KEY]).config;
   firebase.initializeApp(firebaseConfig);
}

function authenticateFirebase() {
   const firebaseAuthConfig = require(config[FIREBASE_ACCESS_TOKEN_KEY])
   return firebase.auth().signInWithEmailAndPassword(firebaseAuthConfig.email, firebaseAuthConfig.password)
      .catch(err => { throw err  });
}

function cacheExists() {
   return fs.existsSync(dataPath);
}

function fetchFromFirebase(createCache) {
   initFirebase();
   return firebase.database().ref(FIREBASE_SITEDATA_ENDPOINT).once('value').then(snapshot => {

      firebase.database().goOffline();
      writeToCache(snapshot.val());
      return snapshot.val();
   });
}

function loadLocalCache() {
   return new Promise((resolve, reject) => {
      fs.readFile(dataPath, 'utf-8', (err, data) => {
         if (err) reject(err);

         resolve(JSON.parse(data));
      });
   });
}

function writeToCache(body) {
   fs.writeFileSync(dataPath, JSON.stringify(body, null, 3));
}
