const axios = require('axios');

const url = `https://hooks.slack.com/services/${process.env.SLACK_CHANNEL}`;
const data = {
  text: 'Test',
  attachments: [{
    title: 'Example log file',
    fields: [{
      title: 'Status',
      value: 'Warning'
    }, {
      title: 'Crunchbase warnings: ',
      value: '5'
    }, {
      title: 'Github warnings: ',
      value: '-'
    }, {
      title: 'Badge warnings: ',
      value: '-'
    }],
    text: `
    Fetching crunchbase entries
***E**E************************************************E***********************************************************************************E*************************************************E************
**********************************************************************************************************************************************************************************************************
*************************************************************************E**********************************************************************************
Using cached entry, because can not fetch: accenture Can't resolve stock ticker ACNN; please manually a 0 [ 'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please
 manually a',
  'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a',
  'Using cached entry, because can not fetch: tencent Can\'t resolve stock ticker 0700; please manually a',
  'Using cached entry, because can not fetch: rackspace Cannot read property \'raw\' of undefined',
  'Using cached entry, because can not fetch: octo-technology Can\'t resolve stock ticker ALOCT; please manually ',
  'Using cached entry, because can not fetch: callidus-software Cannot read property \'raw\' of undefined' ]
Using cached entry, because can not fetch: accenture Can't resolve stock ticker ACNN; please manually a 1 [ 'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please
 manually a',
  'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a',
  'Using cached entry, because can not fetch: tencent Can\'t resolve stock ticker 0700; please manually a',
  'Using cached entry, because can not fetch: rackspace Cannot read property \'raw\' of undefined',
  'Using cached entry, because can not fetch: octo-technology Can\'t resolve stock ticker ALOCT; please manually ',
  'Using cached entry, because can not fetch: callidus-software Cannot read property \'raw\' of undefined' ]
Using cached entry, because can not fetch: tencent Can't resolve stock ticker 0700; please manually a 2 [ 'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please m
anually a',
  'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a',
  'Using cached entry, because can not fetch: tencent Can\'t resolve stock ticker 0700; please manually a',
  'Using cached entry, because can not fetch: rackspace Cannot read property \'raw\' of undefined',
  'Using cached entry, because can not fetch: octo-technology Can\'t resolve stock ticker ALOCT; please manually ',
  'Using cached entry, because can not fetch: callidus-software Cannot read property \'raw\' of undefined' ]
Using cached entry, because can not fetch: rackspace Cannot read property 'raw' of undefined 3 [ 'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a
',
  'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a',
  'Using cached entry, because can not fetch: tencent Can\'t resolve stock ticker 0700; please manually a',
  'Using cached entry, because can not fetch: rackspace Cannot read property \'raw\' of undefined',
  'Using cached entry, because can not fetch: octo-technology Can\'t resolve stock ticker ALOCT; please manually ',
  'Using cached entry, because can not fetch: callidus-software Cannot read property \'raw\' of undefined' ]
Using cached entry, because can not fetch: octo-technology Can't resolve stock ticker ALOCT; please manually  4 [ 'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN;
please manually a',
  'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a',
  'Using cached entry, because can not fetch: tencent Can\'t resolve stock ticker 0700; please manually a',
  'Using cached entry, because can not fetch: rackspace Cannot read property \'raw\' of undefined',
  'Using cached entry, because can not fetch: octo-technology Can\'t resolve stock ticker ALOCT; please manually ',
  'Using cached entry, because can not fetch: callidus-software Cannot read property \'raw\' of undefined' ]
Using cached entry, because can not fetch: callidus-software Cannot read property 'raw' of undefined 5 [ 'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please ma
nually a',
  'Using cached entry, because can not fetch: accenture Can\'t resolve stock ticker ACNN; please manually a',
  'Using cached entry, because can not fetch: tencent Can\'t resolve stock ticker 0700; please manually a',
  'Using cached entry, because can not fetch: rackspace Cannot read property \'raw\' of undefined',
  'Using cached entry, because can not fetch: octo-technology Can\'t resolve stock ticker ALOCT; please manually ',
  'Using cached entry, because can not fetch: callidus-software Cannot read property \'raw\' of undefined' ]
    `
  }, {
    title: 'links status',
    fields: [{
      title: 'Number of redirects',
      value: 20
    }, {
      title: 'Number of errors',
      value: 10
    }],
    text: `
        Item item1 has url aaa redirect to bbb
        Can not fetch url ...
        Item item2 has repo aaa2 redirect to bbb2
    `
  }]
};

async function main() {
  const result = await axios({ method: 'POST', data, url })
  console.info(result);

}
main();
