var templateEngine = require('./templateEngine'),
    data = require('./get-data');

    data.getData(true, true).then(data => {
       templateEngine.reCompile(data);
    });