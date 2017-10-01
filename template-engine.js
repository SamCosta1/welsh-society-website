'use strict'

const Handlebars = require('handlebars'),
   fs = require('fs-extra');

const views = './src/templates';
const dist = './dist';
const partials = './src/templates/partials';

var jsonData = {};
var partialsData = {};
var langs = [];

module.exports.reCompile = (data) => {
   jsonData = data;

   for (var lang in jsonData) {
      if (jsonData.hasOwnProperty(lang))
         langs.push(lang);

      partialsData[lang] = jsonData[lang]['_partials'];
   }

   createDirs();

   registerAllPartials(readMainTemplates);
};

function createDirs() {

   // Create a directory in dist for each language in data
   for (const lang of langs) {
      const fullPath = `${dist}/${lang}`;

      if (fs.existsSync(fullPath)) { // Remove any old files
         fs.removeSync(fullPath);
      }

      fs.mkdirSync(fullPath);
   }
}

function registerAllPartials(callback) {

   fs.readdir(partials, (err, files) => {
      files.forEach(file => {
         registerPartials(file);
      });  // For each file in the partials directory, register the partial
      callback();
   });
}

// Go through each view and compile
function readMainTemplates() {
   fs.readdir(views, (err, files) => {
      files.forEach(file => {
         if (file.endsWith('.html')) {
            readFiles(file.replace(/.html/, ""));
         }
      });
   })
}

function registerPartials(file) {
   const html = fs.readFileSync(`${partials}/${file}`, 'utf-8');

   const partialName = file.replace(/.html/, "");
   Handlebars.registerPartial(partialName, html);

}

function readFiles(file) {
   fs.readFile(`${views}/${file}.html`, 'utf-8', (error, HTML) => { // Read html template file
      if (error) console.log(error);

      for (const lang of langs) {
         compileTemplate(lang, file, jsonData[lang][file], HTML);
      }
   });
}

function compileTemplate(lang, file, data, HTML) {
   data = data ? data : {};

  const template = Handlebars.compile(HTML);
  Object.assign(data, partialsData[lang], { "lang": lang });

  const html = template(data);
  fs.writeFile(`${dist}/${lang}/${file}.html`, html, (err) => {     if (err) return console.log(err);    }); 
}
