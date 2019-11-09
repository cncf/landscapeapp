rm -rf build
rm ../cncf/dist/200.html || true
babel-node tools/build
cp -r ../cncf/dist build
react-snap
cp -r build/ ../cncf/dist

