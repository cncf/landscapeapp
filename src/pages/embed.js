import assetPath from '../utils/assetPath'

const EmbedPage = _ => {
  const src = assetPath(`/card-mode?style=borderless&grouping=license&license=mit-license&embed=yes`)

  return <div>
    <h1>Testing how great is that embed </h1>
    <iframe frameBorder="0" id="landscape" scrolling="no" style={{ width: 1, minWidth: '100%' }} src={src}></iframe>
    <script src={assetPath("/iframeResizer.js")}></script>
    <h2>Wow, that was a cool embed.</h2>
  </div>
}

export async function getStaticProps() {
  const fs = require('fs')
  const path = require('path')
  const filePath = file => path.join(process.cwd(), file)
  const resizerPath = require('child_process').execSync('yarn get-iframe-resizer-path', {encoding: 'utf-8'}).trim();
  const iframeResizerContent = fs.readFileSync(resizerPath, 'utf-8');
  const resizerConfig = fs.readFileSync(filePath('src/iframeResizer.js'), 'utf-8');

  const finalResizer = (iframeResizerContent + '\n' + resizerConfig).replace('sourceMap', '');

  fs.writeFileSync(filePath('public/iframeResizer.js'), finalResizer);
  console.info('finalResizer prepared');

  return { props: {} }
}

export default EmbedPage
