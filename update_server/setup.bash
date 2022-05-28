SERVER_ADDRESS=root@<%= ip %>
nocheck=" -o StrictHostKeyChecking=no "
ssh $nocheck $SERVER_ADDRESS << 'EOSSH'
touch /.cloud-warnings.skip
which git || (
  apt-get update
  apt-get -y install git
)

echo '
0 5 * * * root bash -l -c "rm -rf /landscapeapp || true; git clone https://github.com/cncf/landscapeapp /landscapeapp; cd /landscapeapp; bash landscapes.sh"
55 4 * * * root bash -l -c "sudo reboot"
' > /etc/cron.d/updater
ls "landscapes.env" 2>/dev/null || (
    echo "Creating a file with private settings, /root/landscapes.env,
please fill it with proper keys and tokens"
    echo '
export TWITTER_KEYS=k1,k2,k3,k4
export CRUNCHBASE_KEY=key
export GITHUB_TOKEN=token
export GITHUB_USER=CNCF-Bot
export GITHUB_KEY=key
export SLACK_ERROR_CHANNEL=channel
    ' > "/root/landscapes.env"
)
EOSSH

