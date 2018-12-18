set -e
rm -rf dist || true
mkdir -p dist
# bash build.sh cncf/landscape cncf 1015-try-upstream
# bash build.sh LFDLFoundation/landscape lfdl 33-switch-to-upstream
git commit -m 'lets test! [skip ci]' --allow-empty
git push origin HEAD
