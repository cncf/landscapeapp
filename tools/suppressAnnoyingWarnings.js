const ignoreText = [
  'Failed to adjust OOM score of renderer',
  'Fontconfig warning:',
  'DevTools listening on ws:',
  'go!'
]
const oldInfo = console.info;
const oldLog = console.log;
console.info = function(a) {
  if (a && a.includes) {
    if (ignoreText.every( (x) => !a.includes(x))) {
      oldInfo.apply(console, arguments);
    }
  } else {
    oldInfo.apply(console, arguments);
  }

}
console.log = function(a) {
  if (a && a.includes) {
    if (ignoreText.every( (x) => !a.includes(x))) {
      oldLog.apply(console, arguments);
    }
  } else {
    oldLog.apply(console, arguments);
  }
}

