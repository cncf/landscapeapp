require('child_process').spawnSync('bash', ['-lc',
  " kill -9 `ps ux | grep distServer | grep -v grep | awk -F ' ' '{print $2}'` "
]);
