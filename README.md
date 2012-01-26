#Shibboleth
Sick of juggling passwords in your head? Making each one different enough so to not expose yourself to risk? Shibboleth lets you remember one single master password - and uses it to *generate* a unique password per website.
###How does it work?
Suppose you are logging into Gmail; the URL would look something like this:

    https://accounts.google.com/ServiceLogin?service=mail…
Shibboleth will mash your master password with the [Top-level Domain](http://en.wikipedia.org/wiki/Top-level_domain) (TLD), in this case `google.com`, and create a password unique to `google.com`. To do this it runs your master password and current TLD through a [cryptographic hash function](http://en.wikipedia.org/wiki/Cryptographic_hash_function), specifically the SHA-256 function.
###How do i use it?
There are two ways to use Shibboleth, one is a javascript bookmarklet. This is a little snippet of javascript that is saved as a bookmark in your browser. When you need to log into a website you fill in your username and master password, then click on the Shibboleth bookmarklet and it will replace your master password with your unique password for that particular website.

The second way to use Shibboleth is through the standalone web page. Sometimes, specifically on mobile devices, you will be logging into sites through native applications and the first method described above is not an option. So the standalone web page allows you to manually set the TLD, generate your unique password, copy to the clipboard, & paste it in the native application.

The standalone web page is encoded into a data uri, so no internet access is required to use it.
###Is my password stored anywhere?
Nope. The bookmarklet and standalone web page are both stored on your computer and do not communicate with any server. Check out the source code at [github](https://github.com/firien/shibboleth).
###Site \*\*\*.com limits my password to 10 characters
No problem, append ':xxx' to your master password to truncate it. For example 'master:16' will create a password only 16 characters long.

###Salting
You can choose to include a [Salt](http://en.wikipedia.org/wiki/Salt_%28cryptography%29) in Shibboleth's javascript. This is just one more layer of security (and complexity). It makes the javascript unique to you.

####Why is it named Shibboleth?

##Developers
The website is not finished and a complete mess. I hope to finish it soon and have it running on Heroku.

Run with sinatra `rackup config.ru` => localhost:9292

###*Requires Ruby 1.9*
