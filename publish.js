import { readFileSync }  from 'node:fs'
import { resolve } from 'node:path'
import ttf2woff2 from 'ttf2woff2'
import svg2ttf from 'svg2ttf'

const svgFontPath = resolve('./docs/fonts/font.svg')
const ttfFontPath = resolve('./docs/fonts/font.ttf')

const ttf = svg2ttf(readFileSync(svgFontPath, 'utf8'), {})
fs.writeFileSync(ttfFontPath, Buffer.from(ttf.buffer))

const ttfData = readFileSync(ttfFontPath)
fs.writeFileSync('./docs/fonts/font.woff2', ttf2woff2(ttfData))