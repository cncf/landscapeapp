set -e
npm install -g npm --no-progress
npm ci --no-progress --silent
rm -rf $2 || true
git clone --quiet https://github.com/$1 $2
cd $2
git remote -v
# git remote rm origin 2>/dev/null 1>/dev/null || true
# git remote add origin https://github.com/$1
git checkout origin/$3
cd ..
export PROJECT_PATH=$2
PROJECT_NAME=$2 npm run build
# rm -rf ./$2
# echo "/$2/* /$2/index.html 200" >> dist/_redirects
# echo "<div><a href="$2/"><h1>$2</h1></a></div>" >> dist/index.html
# echo "User-agent: *" > dist/$2/robots.txt
# echo "Disallow: /" >> dist/$2/robots.txt







