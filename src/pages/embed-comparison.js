import assetPath from '../utils/assetPath'

const IframeContainer = ({ path, className, title }) => {
  return <div className={`container ${className}`}>
    <style jsx>{`
      .container {
        width: 50%;
        height: 100vh;
        position: relative;
      }

      .left {
        float: left;
      }

      .right {
        float: right;
      }

      .timer {
        z-index: 1;
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }

      .header {
        background-color: #ffc107;
      }

      .title {
        font-size: 20px;
        font-weight: bold;
      }

      .timer, .header {
        width: 100%;
        position: absolute;
        text-align: center;
        padding: 15px;
      }

      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    `}</style>
    <div className="header">
      <div className="title">{title}</div>
      <a href={assetPath(path)} target="_blank">{path}</a>
    </div>

    <iframe scrolling="no" src={assetPath(path)}></iframe>
  </div>
}

const EmbedComparison = _ => {
  const nonPrerenderedPath = '/card-mode?enduser=yes&style=logo&embed=yes'
  const prerenderedPath = '/pages/end-users'

  return <>
    <IframeContainer className="left" path={nonPrerenderedPath} title="NOT PRE-RENDERED"/>
    <IframeContainer className="right" path={prerenderedPath} title="PRE-RENDERED"/>
  </>
}

export default EmbedComparison
