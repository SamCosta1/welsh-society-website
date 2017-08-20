const   Handlebars = require('handlebars'),
        fs = require('fs-extra'),
        watch = require('node-watch');

const views = './src/templates/views';
const data = './src/templates/data';
const partialData = './src/templates/partials-data';
const dist = './dist';
const partials = './src/templates/partials';
const index = './src/index.html';

var extraData = {};

compileAll();

// Only watch files in debug mode
if (process.argv[2] == "debug" || process.argv[2] == "-d");
  watch('./src/templates', { recursive: true }, function(evt, name) {
    compileAll();
  });

function createDirs() {  

  if (!fs.existsSync(dist))
      fs.mkdirSync(dist);

  // Create a directory in dist for each language in data
  fs.readdir(data, (err, files) => {
    files.forEach(lang => { 
      const fullPath = `${dist}/${lang}`;
      if (fs.existsSync(fullPath)){ // Remove any old files
        fs.removeSync(fullPath);
      }
      fs.mkdirSync(fullPath);
      
    });
  });
}

function compileAll() {
  createDirs();
  copyIndex();

  registerAllPartials();

  registerPartialData(readMainTemplates);
}

function registerPartialData(callback) {
  var allPromises = [];
  
  var callbackSetup = false;
  fs.readdir(partialData, (err, langFolders) => {
      langFolders.forEach(lang => { // For each language in partial data add the contents to the extra data object
          var thisData = {};
          extraData[lang] = thisData;
          // For each file in the language folder, read it and add it to data obj
          fs.readdir(`${partialData}/${lang}`, (err, files) => {
              files.forEach(file => {
                allPromises.push(readPartialDataFile(lang, file, thisData));       
                
                // Setup callback to trigger after all files finished
                if (!callbackSetup) {
                  Promise.all(allPromises).then(callback);
                  callbackSetup = true;
                }
                
              });                        
          });

      });
        
  });
} 
  
function readPartialDataFile(lang, file, thisData) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${partialData}/${lang}/${file}`, 'utf-8', function(error, json) {
      thisData[file.replace(/.json/, "")] = JSON.parse(json);
      resolve();
    });
  });
}

function registerAllPartials() {
  fs.readdir(partials, (err, files) => {
    files.forEach(file => { // For each file in the partials directory, register the partial        
        registerPartials(file);      
    });
    
  });
}

// Just copy the index t o dist (just redirects to default language index)
function copyIndex() {
  fs.copy(`./${index}`, `${dist}/index.html`);
}

// Go through each view and compile
function readMainTemplates() {
  fs.readdir(views, (err, files) => {
    files.forEach(file => {
      readFiles(file.replace(/.html/, ""));
    });
  })
}

function registerPartials(file) {
  fs.readFile(`${partials}/${file}`, 'utf-8', function(error, html) {
    if (error) console.log(error);
    
    Handlebars.registerPartial(file.replace(/.html/, ""), html)
  });
}

function readFiles(file) {
  fs.readFile(`${views}/${file}.html`, 'utf-8', function(error, HTML) { // Read html template file
     if (error) console.log(error);
     
     fs.readdir(data, (err, files) => {
        files.forEach(lang => { // for each language compile the template
          fs.readFile(`${data}/${lang}/${file}.json`, 'utf-8', function(error, json) {
              if (error) console.log(error);
              compileTemplate(lang, file, json, HTML);
          });
        });
     });   
  });
}

function compileTemplate(lang, file, json, HTML) {

  var template = Handlebars.compile(HTML);

  var data = JSON.parse(json);
  Object.assign(data, extraData[lang], { "lang": lang });
  var html = template(data);
  fs.writeFile(`${dist}/${lang}/${file}.html`, html, (err) => {     if (err) return console.log(err);    }); 
}