require('iframe-resizer/js/iframeResizer')

// TODO: see if we can use this instead of the other embed.html
const EmbedPage = _ => {
  const src = "/card-mode?style=borderless&grouping=license&license=mit-license&embed=yes"

  return <div>
    <h1>Testing how great is that embed </h1>
    <iframe frameBorder="0" id="landscape" scrolling="no" style={{ width: 1, minWidth: '100%' }} src={src}></iframe>
    <script src="/iframeResizer.js"></script>
    <h2>Wow, that was a cool embed.</h2>
  </div>
}

export default EmbedPage
