const { generateReport } = require('./reportBuilder');
const input = {
  logs: `
  some long logs are here
  >? ><><><  &&&& test again

  go
  `,
  name: 'lfph',
  messages: [
    { category: 'general', type: 'error', text: 'ERROR: it just went really wring https://cubernetes.io' },
    { category: 'link', type: 'error', text: 'ERROR: failed link just went really wring https://cubernetes.io' },
    { category: 'link', type: 'error', text: 'ERROR: failed link just went really wring https://cubernetes.io2' },
    { category: 'image', type: 'fatal', text: 'FATAL! we failed' },
    { category: 'image', type: 'error', text: 'ERROR! something really went wrong here and again and again and again'},
  ],
  status: true,
  startTime: new Date().getTime() - 5 * 1000,
  endTime: new Date().getTime()

}
const output = generateReport(input);
require('fs').writeFileSync('/tmp/demo.html', output);
