import esbuild from 'esbuild';
import ghPages from 'esbuild-plugin-ghpages-pwa';

const { plugin: githubPages, buildOptions, isProduction } = ghPages({
  name: 'shibboleth',
  app: 'shibboleth',
  description: 'Password Generator',
  cacheTag: 18,//used to clear old browser caches
  serve: 3019// port for local web server
})

try {
  const options = Object.assign(buildOptions, {
    entryPoints: [
      'javascripts/index.js',
      'stylesheets/index.css',
      'images/icon-152.png',
      'images/icon-167.png',
      'images/icon-180.png',
      'images/icon-192.png',
      'images/icon-512.png'
    ],
    assetNames: 'assets/[name]-[hash]',
    loader: {
      '.svg': 'file',
      '.ttf': 'file',
      '.woff2': 'file',
      '.png': 'file',
    },
    target: ['chrome78', 'safari14'],
    plugins: [
      githubPages
    ]
  })
  if (isProduction) {
    await esbuild.build(options)
  } else {
    const ctx = await esbuild.context(options)
    ctx.watch()
  }
} catch (err) {
  console.error(err)
  process.exit(1)
}