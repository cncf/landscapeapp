import _ from 'lodash';
const isNetlify = !!process.env.REPOSITORY_URL;
export default function makeReporter() {
  const items = [];
  return {
    write: function(element) {
      if (isNetlify) {
        items.push(element)
      } else {
        process.stdout.write(element);
      }
    },
    summary: function() {
      if (isNetlify) {
        const parts = _.chunk(items, 160);
        const text = parts.map( (part) => part.join('')).join('\n');
        console.info('Reporting progress:', text);
      } else {
        process.stdout.write("\n");
      }
    }
  };
}
