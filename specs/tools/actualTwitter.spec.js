import actualTwitter from '../../tools/actualTwitter';

describe('Twitter URL', () => {
  describe('when crunchbase data not set', () => {
    const node = { twitter: 'https://twitter.com/foo' };

    test('returns URL from node', async () => {
      expect(actualTwitter(node, null)).toBe(node.twitter)
    })
  });

  describe('when node data not set', () => {
    const crunchbaseData = { twitter: 'https://twitter.com/foo' };

    test('returns URL from node', async () => {
      expect(actualTwitter({}, crunchbaseData)).toBe(crunchbaseData.twitter)
    })
  });

  describe('when both node and crunchbase data are set', () => {
    const node = { twitter: 'https://twitter.com/main' };
    const crunchbaseData = { twitter: 'https://twitter.com/other' };

    test('returns URL from node', async () => {
      expect(actualTwitter(node, crunchbaseData)).toBe(node.twitter)
    })
  });

  describe('when twitter URL is not set anywhere', () => {
    const node = {};
    const crunchbaseData = {};

    test('returns undefined', async () => {
      expect(actualTwitter(node, crunchbaseData)).toBe(undefined)
    })
  });

  describe('cleaning up twitter URL', () => {
    test('replaces http with https', async () => {
      const node = { twitter: 'http://twitter.com/foo' };
      expect(actualTwitter(node)).toBe('https://twitter.com/foo')
    });

    test('removes www', async () => {
      const node = { twitter: 'https://www.twitter.com/foo' };
      expect(actualTwitter(node)).toBe('https://twitter.com/foo')
    });

    test('query string', async () => {
      const node = { twitter: 'https://twitter.com/foo?omg' };
      expect(actualTwitter(node)).toBe('https://twitter.com/foo')
    });
  });
});
