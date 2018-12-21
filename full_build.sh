set -e
rm -rf dist || true
mkdir -p dist

# do not forget a build hook in the end of the file
bash build.sh LFDLFoundation/lfdl-landscape lfdl
bash build.sh cncf/landscape cncf

# This will increase a version and publish to an npm
# If there is an existing package
if [ $BRANCH = "master" ]; then
  git config --global user.email "info@cncf.io"
  git config --global user.name "CNCF-bot"
  git remote rm github || true
  git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
  git fetch github
  yarn version --patch
  git commit -m 'Update to a new version [skip ci]' --allow-empty --amend
  git branch -D tmp || true
  git checkout -b tmp
  git push github HEAD:master
  git push github HEAD:master --tags --force
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
  yarn publish
  curl -X POST -d {} https://api.netlify.com/build_hooks/5c1bd8e14ed62f166e8d9f7f
  curl -X POST -d {} https://api.netlify.com/build_hooks/5c1bd968fdd72a78a54bdcd1
fi
