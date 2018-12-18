set -e
rm -rf dist || true
mkdir -p dist
bash build.sh cncf/landscape cncf 1015-try-upstream
bash build.sh LFDLFoundation/landscape lfdl 33-switch-to-upstream

# This will increase a version and publish to an npm
# If there is an existing package
pwd
git remote rm github || true
echo 1
git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
echo 2
git fetch github
echo 3
git config user.email "info@cncf.io"
echo 4
git config user.name "Netlify Publisher"
echo 5
yarn version --patch
echo 6
git commit -m 'Update to a new version [skip ci]' --allow-empty --amend
echo 7
git branch -D tmp || true
git checkout -b tmp
git push github HEAD:master  --tags
echo 8
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
yarn publish
