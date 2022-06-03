const { getReleaseDate } = require('./githubDates');

async function main() {
  const date = await getReleaseDate({repo: 'rails/rails'});
  console.info(date);
}
main();
