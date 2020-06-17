const result = require('child_process').spawnSync('bash', ['-lc',
  " kill -9 `ps ux | grep ciServer | grep -v grep | awk -F ' ' '{print $2}'` "
]);
console.info(result.stdout.toString('utf-8'));
console.info(result.stderr.toString('utf-8'));
