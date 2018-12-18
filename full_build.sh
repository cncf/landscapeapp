set -e
rm -rf dist || true
mkdir -p dist
# bash build.sh cncf/landscape cncf 1015-try-upstream
# bash build.sh LFDLFoundation/landscape lfdl 33-switch-to-upstream
cd /tmp
git clone "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
cd landscapeapp
git branch
git config --global user.email "info@cncf.io"
git config --global user.name "Netlify Publisher"
git commit -m 'lets test! [skip ci]' --allow-empty
git push origin HEAD
git push origin HEAD --tags
