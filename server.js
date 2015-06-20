var express = require('express');
var app = express();
var fs = require('fs');
var hljs = require('highlight.js');
var cfg;
var rgx = new RegExp(/\bimport ([^\s]+) = require\((?:'|")([^'"]+)/g);

function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}

function hl(code) {
    return hljs.highlight('typescript', code).value;
}

function stripInterfaceKeywords(code) {
    return code.replace('interface ', '');
}

function stripLines(code, number) {
    var lines = code.split('\n');

    if (number) {
        number += 1; // because of new line between imports and the actual interface
        lines.splice(0,number);
    }

    lines.pop(); // remove export= line
    lines.pop(); // remove export= line

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

function extractNameAndPathsForNestedScripts(code) {
    var matches = [];
    var match;

    while ( (match = rgx.exec(code)) != null ) {
        matches.push([match[1], match[2]]);
    }

    return matches;
}

function prepare(code, numberOfImportLines) {
    code = stripLines(code, numberOfImportLines);
    code = stripInterfaceKeywords(code);
    code = hl(code);
    return code;
}

function parseScript(path, basePath) {
    var code = readFile(path);
    var nestedCode = extractNameAndPathsForNestedScripts(code);
    var l = nestedCode.length;
    var i;
    var j;
    var v;
    var temp;
    var code;

    code = prepare(code, l);

    for (i = 0; i < l; i ++) {
        v = nestedCode[i];
        temp = parseScript(basePath + v[1] + '.d.ts', basePath);
        code = code.replace(v[0]+';', '<div class="nested">'+temp+'</div>');
        code = code.replace('&lt;'+v[0]+'&gt;;', '<div class="nested">'+temp+'</div>');
    }

    return code;
}

function constructCodeFromDescriptor(descriptor) {
    return wrap(parseScript(descriptor.path, descriptor.nestingBasePath), descriptor);
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

app.get('/routes/:cat/:pos', function (req, res) {
    var routes = cfg[req.params.cat].routes[req.params.pos];

    var result = routes.interfaces.map(constructCodeFromDescriptor);

    res.setHeader('Content-Type', 'text/html');
    res.send( title(routes) + result.join('') );
});

app.listen(9998);
