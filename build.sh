set -e
rm -rf $2 || true
git clone https://github.com/$1 $2
cd $2
git checkout origin/$3
cd ..
export PROJECT_PATH=$2
yarn build
mkdir -p dist
cp -r $2/dist dist/$2
babel-node tools/updateIndexFile.js $2
echo "/$2/* /$2/index.html 200" >> dist/_redirects
echo "<div><a href="$2/index.html"><h1>$2</h1></a></div>" >> dist/index.html







