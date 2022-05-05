// this server is usually used locally

const projectPath = process.env.PROJECT_PATH;

const http = require('http');
const fs = require('fs');
const path = require('path');

const apiIds = require('./src/api/ids');
const apiExport = require('./src/api/export');


//


http.createServer(function (request, response) {
  console.log('request starting...', request.url);

  if (request.url.indexOf('/api/ids') !== -1) {
    const query = request.url.split('?')[1] || '';
    const output = apiIds.processRequest(query);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
    return;
  }
  if (request.url.indexOf('/api/export') !== -1) {
    const query = request.url.split('?')[1] || '';
    const output = apiExport.processRequest(query);
    response.writeHead(200, {
      'Content-Type': 'text/css',
      'Content-Disposition': 'attachment; filename=interactive-landscape.csv'
    });
    response.end(output);
    return;
  }
  let filePath = path.join(process.env.PROJECT_PATH, 'dist', request.url.split('?')[0]);
  console.info(filePath);
  if (filePath == `${process.env.PROJECT_PATH}/dist/`) {
    filePath = `${process.env.PROJECT_PATH}/dist/index.html`;
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
console.log('Development server running at http://127.0.0.1:8001/');
