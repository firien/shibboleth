import assert from 'assert';
import { tld } from '../docs/javascripts/hasher.js'
import * as url from 'url';

// https://en.wikipedia.org/wiki/List_of_most_popular_websites
const websites = [
  'google.com',
  'wikipedia.org',
  '360.cn',
  'sina.com.cn',
  'csdn.net',
  'yahoo.co.jp',
  'google.com.hk',
  'twitch.tv',
  'mail.ru',
  'google.co.in',
  'google.com.br',
  'google.de',
  'google.fr',
  'google.it',
  'google.es',
  'google.co.uk',
  'google.com.tr'
]
describe('Domain', function() {
  it('should find domain', function(){
    for (let website of websites) {
      let uri = url.parse(`https://accounts.${website}`)
      assert.equal(tld(uri), website)
    }
  });
});