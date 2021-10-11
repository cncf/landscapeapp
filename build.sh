set -e
rm -rf $2 || true
timeout 120s git clone --quiet https://github.com/$1 $2
cd $2
git remote -v
cd ..
export PROJECT_PATH=$PWD/$2
PROJECT_NAME=$2 yarn build
