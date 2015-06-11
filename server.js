var express = require('express');
var app = express();
var fs = require('fs');
var hljs = require('highlight.js');
var cfg;
var rgx = new RegExp(/\bimport ([^\s]+) = require\((?:'|")([^'"]+)/g);

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

function hl(code) {
    return hljs.highlight('typescript', code).value;
}

function strip(code) {
    return code.replace('interface ', '');
}

function stripLines(code, number){
    var lines = code.split('\n');
    if(number){
        number += 1; // because of new line between imports and the actual interface
        lines.splice(0,number);
    }
    lines.pop();
    return lines.join('\n');
}

function wrapCode(code) {
    return '<div class="wrapped-code"><pre><code>'+code+'</code></pre></div>';
}

function title(config) {
    return '<h1>'+config.method+' '+config.path+'</h1>';
}

function h2(text) {
    return '<h2>'+text+'</h2>';
}

function wrap(code, descriptor) {
    return h2(descriptor.name) + wrapCode(code);
}

function extractNested(code) {
    var matches = [];
    var match;

    while ( (match = rgx.exec(code)) != null ) {
        matches.push([match[1], match[2]]);
    }

    return matches;
}

function prepare(code, numberOfImportLines) {
    code = stripLines(code, numberOfImportLines);
    code = strip(code);
    code = hl(code);
    return code;
}

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

    if(cfg) {
        res.end(JSON.stringify(cfg));
        return;
    }

    fs.readFile('./config.json', {}, function ( err, data ) {
        if ( err ) {
            throw err;
        }
        cfg = JSON.parse(data);
        res.end(data);
    });
});

function constructCodeFromDescriptor(descriptor) {
    var code;
    var nestedCode;
    var temp;
    var i;
    var l;
    var v;

    code = read(descriptor.path);

    nestedCode = extractNested(code);
    l = nestedCode.length;

    code = prepare(code, l);

    for (i = 0; i < l; i ++) {
        v = nestedCode[i];

        temp = read(descriptor.nestingBasePath + v[1]+'.d.ts');
        temp = prepare(temp, 0);

        code = code.replace(v[0]+';', v[0]+'<div class="nested">'+temp+'</div>');
    }

    return wrap(code, descriptor);
}

app.get('/routes/:cat/:pos', function (req, res) {
    var routes = cfg[req.params.cat].routes[req.params.pos];

    var result = routes.interfaces.map(constructCodeFromDescriptor);

    res.setHeader('Content-Type', 'text/html');
    res.send( title(routes) + result.join('') );
});

app.listen(9998);
