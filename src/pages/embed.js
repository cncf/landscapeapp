import assetPath from '../utils/assetPath'

const EmbedPage = _ => {
  const src = `${process.env.basePath}/card-mode?style=borderless&grouping=license&license=mit-license&embed=yes`

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
  const iframeResizerContent = fs.readFileSync(filePath('node_modules/iframe-resizer/js/iframeResizer.min.js'), 'utf-8');
  const resizerConfig = fs.readFileSync(filePath('src/iframeResizer.js'), 'utf-8');

  const finalResizer = (iframeResizerContent + '\n' + resizerConfig).replace('sourceMap', '');

  fs.writeFileSync(filePath('public/iframeResizer.js'), finalResizer);

  return { props: {} }
}

export default EmbedPage
