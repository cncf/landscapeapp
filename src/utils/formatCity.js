const rules = {
  'Hong Kong, Hong Kong': 'Hong Kong, China',
  'Taiwan, Taiwan': 'Taiwan, China',
  'Sheung Wan, Hong Kong': 'Hong Kong, China'
};
export default function formatCity({city, region, country}) {
  if (!city) {
    return null;
  }
  if (!country) {
    return `${city}, ${region}`;
  }
  if (country === 'United States') {
    return `${city}, ${region}`;
  }
  const result = `${city}, ${country}`;
  return rules[result] || result;
}
