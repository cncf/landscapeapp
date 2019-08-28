set -e
rm -rf dist || true
mkdir -p dist

# uncomment below when about to test a googlebot rendering
# echo '<head><meta name="google-site-verification" content="27ZKkPQS2PWkd_0jqsSq4yUgUZ_BBTYjABudtQpMhXI" /></head>' > dist/index.html
npm install -g npm
npm ci
# bash build.sh LFDLFoundation/lfdl-landscape lfdl 260-remove-members.yml
# bash build.sh cncf/landscape cncf master
# bash build.sh lf-edge/lfedge-landscape lf-edge 260-remove-members.yml
bash build.sh AcademySoftwareFoundation/aswf-landscape aswf 260-remove-members.yml
bash build.sh graphql/graphql-landscape 260-remove-members.yml
bash build.sh ZeusTheTrueGod/omp-landscape 260-remove-members.yml

# bash build.sh lf-edge/lfedge-landscape lf-edge
echo "User-agent: *" > dist/robots.txt
# comment below when about to test a googlebot rendering
echo "Disallow: /" >> dist/robots.txt

# This will increase a version and publish to an npm
# If there is an existing package
if [ $BRANCH = "master" ]; then
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
  curl -X POST -d {} https://api.netlify.com/build_hooks/5c1bd8e14ed62f166e8d9f7f
  curl -X POST -d {} https://api.netlify.com/build_hooks/5c1bd968fdd72a78a54bdcd1
  curl -X POST -d {} https://api.netlify.com/build_hooks/5c80e31894c5c7758edb31e4
  curl -X POST -d {} https://api.netlify.com/build_hooks/5d5c7ca6dc2c51cf02381f63
  curl -X POST -d {} https://api.netlify.com/build_hooks/5d5c7ccf64ecb5bd3d2592f7
fi
