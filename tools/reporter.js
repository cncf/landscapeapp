import colors from 'colors';
const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));

let messages = [];
export function getMessages() {
  return messages;
}

try {
  messages = JSON.parse(require('fs').readFileSync('/tmp/landscape.json', 'utf-8'));
} catch(ex) {

}


export default function build(category) {
  return {
    addError: function(msg) {
      console.info(error(`ERROR: ${msg}`));
      messages.push({
        type: 'error',
        text: msg,
        category: category
      });
      save();
    },
    addFatal: function(msg) {
      console.info(fatal(`FATAL: ${msg}`));
      messages.push({
        type: 'fatal',
        text: msg,
        category: category
      });
      save();
    }
  };
}

function save() {
  require('fs').writeFileSync('/tmp/landscape.json', JSON.stringify(messages, null, 4));
}
