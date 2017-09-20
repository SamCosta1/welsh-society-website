var templateEngine = require('./template-engine'),
    data = require('./get-data');

    data.getData(true, true).then(data => {
       templateEngine.reCompile(data);
    });