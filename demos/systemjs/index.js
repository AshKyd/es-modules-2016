var System = require('systemjs');
System.import('./module.js')
    .then(phrases => phrases.hello('BrisJS') )
    .catch(error => console.log('oh dear') );
