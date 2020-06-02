module.exports = results => (`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.2/css/bulma.min.css">
</head>
<body>
<section class="section">
    <div class="container">
        <div class="columns is-multiline">
            ${results.map(({ landscape, exitCode }) => {
                return `
                  <div class="column is-one-third-widescreen is-half-desktop is-full-tablet">
                    <div style="display: flex; justify-content: center">
                      <img src="${landscape.name}/images/right-logo.svg" style="height: 35px"
                           alt="${landscape.name}"/>
                    </div>
                    ${ exitCode === 0 ?
                      `<a href="${landscape.name}/" target="_blank" rel="noopener noreferrer">
                        <img src="${landscape.name}/images/landscape_preview.png"/>
                       </a>` :
                       `<div class="message is-danger is-large"><div class="message-body" style="border: none; text-align: center">FAILED</div></div>` }
                  </div>
                `
            }).join('')}
        </div>
    </div>
</section>
</body>
</html>
`)
