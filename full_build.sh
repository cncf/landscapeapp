set -e
rm -rf dist || true
mkdir -p dist
# bash build.sh cncf/landscape cncf 1015-try-upstream
# bash build.sh LFDLFoundation/landscape lfdl 33-switch-to-upstream
git remote rm github || true
git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
git fetch github
git config --global user.email "info@cncf.io"
git config --global user.name "Netlify Publisher"
yarn version --patch
git commit -m 'lets test! [skip ci]' --allow-empty --amend
git checkout -b tmp
git push github HEAD:master  --tags
