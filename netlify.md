We use netlify for builds and deploys.
For landscapeapp project we rely on parallel builds. 
Netlify runs a build for a given PR on a landscapeapp.
The netlifyBuild.js file then uses rsync to xcopy the current folder to
our prepared packet server. On that packet server we run all the landscapes in
parallel using a netlify docker image. The output from each landscape is captured and returned back
to the Netlify cloud server. The dist folder is returned back to the cloud
server via rsync. 

Most chances is that we will switch to a different build tool soon, so this is
an experimental approach to speedup netlify builds.
