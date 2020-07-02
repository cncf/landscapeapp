const result = require('child_process').spawnSync('bash', ['-lc',
  " kill -9 `ps ux | grep ciServer | grep -v grep | awk -F ' ' '{print $2}'` "
]);
