# Shibboleth
Sick of juggling passwords in your head? Paranoid about cloud syncing password managers?  Shibboleth lets you remember one single master password - and uses it to *generate* a unique password per website.

### How does it work?
Suppose you are logging into Gmail; the URL would look something like this:

    https://accounts.google.com/ServiceLogin?service=mail…
Shibboleth will mash your master password with the current domain (stripped of subdomains), in this case `google.com`, and create a password unique to `google.com`. To do this it runs your master password and current domain through a [cryptographic hash function](http://en.wikipedia.org/wiki/Cryptographic_hash_function), specifically the SHA-512 function.
### How do I use it?

Shibboleth is a [PWA](https://developer.mozilla.org/en-US/docs/Web/Apps/Progressive). 
It is designed to keep your master password out of the DOM and your clipboard. Just drag the address bar into the Domain field, type your master password, and drag the generated password out.

### Is my password stored anywhere?
Nope. Apart from downloading assets from github.io, Shibboleth does not communicate with any web server. Any cached data, like domains, are stored locally on the browser. Check out the source code at [github](https://github.com/firien/shibboleth).

### Site \*\*\*.com limits my password to 16 characters
No problem, append ':xxx' to your master password to truncate it. For example `masterpassword:16` will create a password only 16 characters long.

### Salting
You can choose to include a [Salt](http://en.wikipedia.org/wiki/Salt_%28cryptography%29) in Shibboleth's javascript. This is just one more layer of security (& complexity). This will regenerate the links with javascript that is unique to you. However, if you wish to use Shibboleth across different browsers and devices - you will need to manually import the same salt into each PWA. There is no cloud syncing.

#### Why is it named Shibboleth?
Judges 12:6

## Developers

svg files in glyphs/ folder are 16x16. Scale to 992px.
```js
const svgpath = require('svgpath');
const path = 'M 0 8 a 12 22 1 0 1 16 0 a 12 22 1 0 1 -16 0 z M 8,4 a 4 4 0 0 0 0 8 a 4 4 0 0 0 0 -8 z M 8,6 a 2 2 0 0 0 0 4 a 2 2 0 0 0 0 -4 z';
svgpath(path).translate(-8, -8).scale(62,62).round(1).toString()
svgpath(path).unarc().scale(62, -62).translate(0,992).round(1).toString()
```

> npx svg2ttf fonts/font.svg fonts/font.ttf

Testing

> ./node_modules/mocha/bin/mocha --experimental-modules test/domain.js