# Shibboleth
Sick of juggling passwords in your head? Making each one different enough so to not expose yourself to risk? Shibboleth lets you remember one single master password - and uses it to *generate* a unique password per website.
### How does it work?
Suppose you are logging into Gmail; the URL would look something like this:

    https://accounts.google.com/ServiceLogin?service=mail…
Shibboleth will mash your master password with the current domain (stripped of subdomains), in this case `google.com`, and create a password unique to `google.com`. To do this it runs your master password and current domain through a [cryptographic hash function](http://en.wikipedia.org/wiki/Cryptographic_hash_function), specifically the SHA-256 function.
### How do I use it?
There are two ways to use Shibboleth.
#### 1. Bookmarklet
This is a little snippet of javascript that is saved as a bookmark in your browser. When you need to log into a website you fill in your username and master password, then click on the Shibboleth bookmarklet and it will replace your master password with your unique password for that particular website.
#### 2. Web App
Sometimes, specifically on mobile devices, you will be logging into sites through native applications and the bookmarklet method is not an option. So the standalone web app allows you to manually set the domain, generate your unique password, copy to the clipboard, and paste it in the native application.

The standalone web app is encoded into a data uri, so internet access is NOT required to use it.
### Is my password stored anywhere?
Nope. The bookmarklet and standalone web app are both stored on your device and do not communicate with any server. Check out the source code at [github](https://github.com/firien/shibboleth).
### Site \*\*\*.com limits my password to 16 characters
No problem, append ':xxx' to your master password to truncate it. For example `master:16` will create a password only 16 characters long.

### Salting
You can choose to include a [Salt](http://en.wikipedia.org/wiki/Salt_%28cryptography%29) in Shibboleth's javascript. This is just one more layer of security (& complexity). This will regenerate the links with javascript that is unique to you. However, if you wish to regenerate Shibboleth, you will need to enter your original salt. If you do use a salt - remember to store it somewhere safe.

#### Why is it named Shibboleth?
Judges 12:6

## Developers

svg files in glyphs/ folder are 16x16. Scale to 1000px.
```js
const svgpath = require('svgpath');
const path = 'M 0 8 a 12 22 1 0 1 16 0 a 12 22 1 0 1 -16 0 z M 8,4 a 4 4 0 0 0 0 8 a 4 4 0 0 0 0 -8 z M 8,6 a 2 2 0 0 0 0 4 a 2 2 0 0 0 0 -4 z';
svgpath(path).translate(-8, -8).scale(62,62).round(1).toString()
svgpath(path).unarc().scale(62, -62).translate(0,992).round(1).toString()
```

> npx svg2ttf fonts/font.svg fonts/font.ttf
