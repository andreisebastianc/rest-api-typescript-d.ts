var express = require('express');
var app = express();
var fs = require('fs');
var hljs = require('highlight.js');

app.get('/', function (req, res) {
  fs.readFile('index.html', {}, function ( err, data ) {
        if ( err ) {
            throw err;
        }
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
  });
});

app.get('/config/', function (req, res) {
  fs.readFile('./config.json', {}, function ( err, data ) {
        if ( err ) {
            throw err;
        }
        res.end(data);
  });
});

app.get('/routes/:url', function (req, res) {
  fs.readFile(req.params.url, {}, function ( err, data ) {
        if ( err ) {
            throw err;
        }
        res.setHeader('Content-Type', 'text/html');
        res.end( hljs.highlight('typescript', ''+data).value );
  });
});

app.listen(9998);
