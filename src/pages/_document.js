import Document, { Html, Head, Main, NextScript } from 'next/document'

// ALl this is necessary to set the lang attribute on <html>...
class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
