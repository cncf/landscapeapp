process.env.PORT=4000;
require('../server.js');
require('fs').writeFileSync('/tmp/ci.pid', process.pid.toString());
