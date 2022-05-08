// acts as a dev server and a dist server
// netlify does not use this

const projectPath = process.env.PROJECT_PATH;

const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer(function (request, response) {

  if (request.url.indexOf('/api/ids') !== -1) {
    console.log('api request starting...', request.url);
    const query = request.url.split('?')[1] || '';

    if (!process.env.INLINE_API) {
      require('child_process').exec(`babel-node src/api/ids.js '${query}'`, {}, function(e, output, err) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(output);
      });
    } else {
      const output = require('./src/api/ids.js').processRequest(query);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(output));
    }
    return;
  }
  if (request.url.indexOf('/api/export') !== -1) {
    console.log('api request starting...', request.url);
    const query = request.url.split('?')[1] || '';

    if (!process.env.INLINE_API) {
      require('child_process').exec(`babel-node src/api/export.js '${query}'`, {}, function(e, output, err) {
        response.writeHead(200, {
          'Content-Type': 'text/css',
          'Content-Disposition': 'attachment; filename=interactive-landscape.csv'
        });
        response.end(output);
      });
    } else {
      const output = require('./src/api/export.js').processRequest(query);
      response.writeHead(200, {
        'Content-Type': 'text/css',
        'Content-Disposition': 'attachment; filename=interactive-landscape.csv'
      });
      response.end(output);
    }
    return;
  }
  let filePath = path.join(process.env.PROJECT_PATH, 'dist', request.url.split('?')[0]);
  if (fs.existsSync(path.resolve(filePath, 'index.html'))) {
    filePath = path.resolve(filePath, 'index.html');
  } else if (fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html'
  }

  const extname = path.extname(filePath);
  let encoding = 'utf-8';
  var contentType = 'text/html; charset=utf-8';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript; charset=utf-8';
      break;
    case '.css':
      contentType = 'text/css; charset=utf-8';
      break;
    case '.json':
      contentType = 'application/json; charset=utf-8';
      break;
    case '.svg':
      contentType = 'image/svg+xml; charset=utf-8';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      encoding = undefined;
      break;
    case '.png':
      contentType = 'image/png';
      encoding = undefined;
      break;
    case '.pdf':
      contentType = 'application/pdf';
      encoding = undefined;
      break;
  }

  fs.readFile(filePath, encoding, function(error, content) {
    if (error) {
      const extraPath = filePath + '.html';
      fs.readFile(extraPath, encoding, function(error, content) {
        if (error) {
          if(error.code == 'ENOENT') {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end('404. Not found. ', 'utf-8');
          } else {
            response.writeHead(500);
            response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            response.end();
          }
        } else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        }
      });
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}).listen(process.env.PORT || 8001);
console.log(`Development server running at http://127.0.0.1:${process.env.PORT || 8001}/`);
