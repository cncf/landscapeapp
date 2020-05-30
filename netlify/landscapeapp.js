const a = [1,2,3];

async function main() {
  const results = await Promise.all(a.map(async function(i) { return i; }));
  console.info(results);
}
main();
