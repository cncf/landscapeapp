const isNetlify = !!process.env.REPOSITORY_URL;
console.info(isNetlify);
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
        process.stdout.write(items.join(''));
      }
    }
  };
}
