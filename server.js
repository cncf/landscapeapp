const http = require('http');
const fs = require('fs');
const path = require('path');
const api = require('./src/pages/api/items');


// a simple server. Serves files from public/
//
//


http.createServer(function (request, response) {
  console.log('request starting...', request.url);
  if (request.url.indexOf('/api/items') !== -1) {
    const query = request.url.split('?')[1] || '';
    const output = api.processRequest(query);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
    return;
  }
  let filePath = path.join('public',  request.url);
  console.info(filePath);
  if (filePath == 'public/')
    filePath = 'public/index.html';

  const extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT') {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end('404. Not found. ', 'utf-8');
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
        response.end();
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}).listen(8001);
console.log('Development server running at http://127.0.0.1:8001/');
