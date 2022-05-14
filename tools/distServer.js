process.env.PORT=4000;
process.env.INLINE_API = true;
require('../server.js');
require('fs').writeFileSync('/tmp/ci.pid', process.pid.toString());
