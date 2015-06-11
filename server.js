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

var cfg;

app.get('/config/', function (req, res) {

    if(cfg) {
        res.end(JSON.restify(cfg));
    }

    fs.readFile('./config.json', {}, function ( err, data ) {
        if ( err ) {
            throw err;
        }
        cfg = JSON.parse(data);
        res.end(data);
    });
});

function read(path) {
    var code = fs.readFileSync(path, 'utf8');
    code = strip(code);
    return hljs.highlight('typescript', code).value;
}

function strip(code) {
    return code.replace('export =', '');
}

function wrapCode(code, className) {
    return '<div class="'+className+'"><pre><code>'+code+'</code></pre></div>';
}

function title(config) {
    return '<h1>'+config.method+' '+config.path+'</h1>';
}

function h2(text) {
    return '<h2>'+text+'</h2>';
}

function wrap(code, isRequest) {
    if (isRequest) {
        return h2('Request') + wrapCode(code, 'request');
    } else {
        return h2('Response') + wrapCode(code, 'response');
    }
}

app.get('/routes/:cat/:pos', function (req, res) {
    var cat = req.params.cat;
    var pos = req.params.pos;
    var reqCode;
    var resCode;
    var path;
    var routes;

    routes = cfg[cat].routes[pos];

    if(path = routes.requestFile) {
        reqCode = read(path);
    }

    if(path = routes.responseFile) {
        resCode = read(path);
    }

    res.setHeader('Content-Type', 'text/html');
    res.send( title(routes) + wrap(reqCode,true) + wrap(resCode,false) );
});

app.listen(9998);
