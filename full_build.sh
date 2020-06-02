set -e
rm -rf dist || true
mkdir -p dist

./node_modules/.bin/babel-node tools/netlifyBuild.js

echo "User-agent: *" > dist/robots.txt
# comment below when about to test a googlebot rendering
echo "Disallow: /" >> dist/robots.txt

# This will increase a version and publish to an npm
# If there is an existing package
if [ "$BRANCH" = "master" ]; then
  git config --global user.email "info@cncf.io"
  git config --global user.name "CNCF-bot"
  git remote rm github 2>/dev/null || true
  git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
  git fetch github
  # git diff # Need to comment this when a diff is too large
  git checkout -- .
  npm version patch
  git commit -m 'Update to a new version [skip ci]' --allow-empty --amend
  git branch -D tmp || true
  git checkout -b tmp
  git push github HEAD:master
  git push github HEAD:master --tags --force
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
  git diff
  npm -q publish || (sleep 5 && npm -q publish) || (sleep 30 && npm -q publish)
  echo 'Npm package published'
  ./node_modules/.bin/babel-node tools/netlifyTriggerHooks.js
fi
