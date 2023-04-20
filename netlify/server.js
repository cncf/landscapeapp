// this "server.js" script should be able to run everything itself, without
// having to bother with any packages or similar problems.
const fs = require('fs/promises');
const path = require('path');

const oldCreateConnection = require('https').globalAgent.createConnection;
require('https').globalAgent.createConnection = function(options, cb) {
    options.highWaterMark = 1024 * 1024;
    options.readableHighWaterMark = 1024 * 1024;
    return oldCreateConnection.apply(this, [options, cb]);
}


// we will get a content of all files, in a form of entries
// "file", "content", "md5"
async function getContent() {
    const dirs = ["images", "hosted_logos", "cached_logos"];
    const files = ["landscape.yml", "settings.yml", "processed_landscape.yml", "guide.md"];
    const all = [];
    for (let dir of dirs) {
        const filesInDir = await fs.readdir(dir);
        for (let file of filesInDir) {
            if (file !== '.' && file !== '..') {
                const content = await fs.readFile(`${dir}/${file}`, { encoding: 'base64'});
                const md5 = require('crypto').createHash('md5').update(content).digest("hex");
                all.push({
                    file: `${dir}/${file}`,
                    content: content,
                    md5: md5
                });
            }
        }
    }
    for (let file of files) {
        let content;
        try {
            content = await fs.readFile(file, { encoding: 'base64'});
        } catch(ex) {

        }
        if (content) {
            const md5 = require('crypto').createHash('md5').update(content).digest("hex");
            all.push({
                file: file,
                content: content,
                md5: md5
            });
        }
    }
    return all;
}

function get(path) {
    return new Promise(function(resolve) {
        const base = process.env.DEBUG_SERVER ? 'http://localhost:3000' : 'https://weblandscapes.ddns.net';
        const http = require(base.indexOf('http://') === 0 ? 'http' : 'https');
        const originalPath = path;
        path = `${base}/api/console/download/${path}`;
        const req = http.request(path, function(res) {
            const path1 = originalPath.replace('?', '.html?');
            if (res.statusCode === 404 && path.indexOf('.html') === -1) {
              get(path1).then( (x) => resolve(x));
            } else {
              resolve({
                res: res,
                headers: res.headers,
                statusCode: res.statusCode
              });
            }
        });
        req.end();
    });
}

function post({path, request}) {
    return new Promise(function(resolve) {
        const base = process.env.DEBUG_SERVER ? 'http://localhost:3000' : 'https://weblandscapes.ddns.net';
        const http = require(base.indexOf('http://') === 0 ? 'http' : 'https');

        let data = '';
        const req = http.request({
            hostname: base.split('://')[1].replace(':3000', ''),
            port: base.indexOf('3000') !== -1 ? '3000' : 443,
            path: path,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }, function(res) {
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('close', function() {
                resolve(JSON.parse(data));
            });
        });
        req.write(JSON.stringify(request));
        req.end();
    });
}

// a build is done on a server side, instead of a client side, this
// is a key moment
// 1. get content (that is fast)
// 2. send a list of hashes
// 3. get back a list of existing hashes
// 4. send a list of (file, content, hash) , but skip the content when a hash is on the server
// 5. get a build result on a server
let previousGlobalHash;
let lastOutput;
let currentPath;
async function build() {
    const files = await getContent();
    if (!previousGlobalHash) {
        console.info(`Starting a new build...`);
    }
    if (JSON.stringify(files.map( (x) => x.md5)) === previousGlobalHash) {
        return;
    }
    if (previousGlobalHash) {
        console.info(`Changes detected, starting a new build`);
    }
    previousGlobalHash = JSON.stringify(files.map( (x) => x.md5));
    const availableIds = await post({path: '/api/console/ids', request: { ids: files.map( (x) => x.md5 ) }});
    const availableSet = new Set(availableIds.existingIds);
    const filesWithoutExtraContent = files.map( (file) => ({
        file: file.file,
        md5: file.md5,
        content: availableSet.has(file.md5) ? '' : file.content
    }));
    const result = await post({path: '/api/console/preview', request: { files: filesWithoutExtraContent }});
    if (result.success) {
        currentPath = result.path;
        console.info(`${new Date().toISOString()} build result: ${result.success ? 'success' : 'failure'} `);
    } else {
        lastOutput = result.output;
        console.info(`${new Date().toISOString()} build result: ${result.success ? 'success' : 'failure'} `);
        console.info(result.output);
    }
}

function server() {
    const http = require('http');
    http.createServer(async function (request, response) {
        if (!currentPath) {
            response.writeHead(404);
            if (lastOutput) {
                response.end(lastOutput);
            } else {
                response.end('Site is not ready');
            }
        } else {
            let filePath = request.url.split('?')[0];
            const url = path.join(currentPath, 'dist', filePath + '?' + request.url.split('?')[1]);
            console.info(`Fetching ${url}`);
            const output = await get(url);
            response.writeHead(output.statusCode, output.headers);
            output.res.pipe(response);
        }

    }).listen(process.env.PORT || 8001);
    console.log(`Development server running at http://127.0.0.1:${process.env.PORT || 8001}/`);
}

async function main() {
    server();
    //eslint-disable-next-line no-constant-condition
    while(true) {
        await build();
    }
}
main().catch(function(ex) {
    console.info(ex);
});
// how will a server work?
