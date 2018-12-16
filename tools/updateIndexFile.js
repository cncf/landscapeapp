// update generated files so they reference a proper location
//
const filesLocation = process.argv[2];

replace('/main', '/cncf/main', 'index.html'); // - in index.html
replace('/favicon', '/cncf/favicon', 'index.html'); // - in index.html
replace('/assets', '/cncf/assets', 'index.html'); // - in index.html
replace('url(/', 'url(/cncf/', 'main.css'); // - in main.css
replace('/images', '/cncf/images', 'main.js'); // - in  main.js
replace('/logos', '/cncf/logos', 'main.js'); // - in main.js
replace('/data.json', '/cncf/data.json', 'main.js') // - in main.js
replace('/logos', '/cncf/logos', 'data.json') // - in data.json
