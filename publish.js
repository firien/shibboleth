import * as fs from 'fs';
import * as path from 'path';
import pug from 'pug'
import ttf2woff2 from 'ttf2woff2'
import svg2ttf from 'svg2ttf'

const filePath = path.resolve('./views/index.pug');
const html = pug.renderFile(filePath, {pretty: true});
const newFileName = path.resolve('./docs/index.html');
fs.writeFileSync(newFileName, html);

const svgFontPath = path.resolve('./docs/fonts/svg.ttf');
const ttfFontPath = path.resolve('./docs/fonts/font.ttf');

const ttf = svg2ttf(fs.readFileSync(svgFontPath, 'utf8'), {});
fs.writeFileSync(ttfFontPath, new Buffer(ttf.buffer));

const ttf = fs.readFileSync(fontPath);
fs.writeFileSync('./docs/fonts/font.woff2', ttf2woff2(ttf));