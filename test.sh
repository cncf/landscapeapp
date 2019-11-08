rm -rf build
babel-node tools/build
cp -r ../cncf/dist build
react-snap
cp -r build ../cncf/dist

