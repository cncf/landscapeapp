set -e
rm -rf dist || true
mkdir -p dist

bash build.sh LFDLFoundation/landscape lfdl 33-switch-to-upstream
bash build.sh cncf/landscape cncf 1015-try-upstream

# This will increase a version and publish to an npm
# If there is an existing package
if [ $BRANCH = "master" ]; then
  git config --global user.email "info@cncf.io"
  git config --global user.name "Netlify Publisher"
  git remote rm github || true
  git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
  git fetch github
  yarn version --patch
  git commit -m 'Update to a new version [skip ci]' --allow-empty --amend
  git branch -D tmp || true
  git checkout -b tmp
  git push github HEAD:master  --tags
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
  yarn publish
fi
