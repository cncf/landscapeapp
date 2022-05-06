import 'regenerator-runtime/runtime';
import actualTwitter from '../../tools/actualTwitter';

describe('Twitter URL', () => {
  describe('when crunchbase data not set', () => {
    const node = { twitter: 'https://twitter.com/foo' };

    test('returns URL from node', async () => {
      expect(actualTwitter(node, null)).toBe(node.twitter)
    })
  });

  describe('when node does not have twitter URL', () => {
    const crunchbaseData = { twitter: 'https://twitter.com/foo' };

    test('returns URL from node', async () => {
      expect(actualTwitter({}, crunchbaseData)).toBe(crunchbaseData.twitter)
    })
  });

  describe('when node has twitter URL set to null', () => {
    const crunchbaseData = { twitter: 'https://twitter.com/foo' };
    const node = { twitter: null };

    test('returns undefined', async () => {
      expect(actualTwitter(node, crunchbaseData)).toBe(undefined)
    })
  });

  describe('when both node and crunchbase have twitter URL', () => {
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
