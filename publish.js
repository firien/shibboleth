import * as fs from 'fs';
import * as path from 'path';
import pug from 'pug'
import ttf2woff2 from 'ttf2woff2'
import svg2ttf from 'svg2ttf'

const pugFile = path.resolve('./views/index.pug');

export const generateHTML = (pugFile) => {
  const html = pug.renderFile(pugFile, {pretty: true});
  const newFileName = path.resolve('./docs/index.html');
  fs.writeFileSync(newFileName, html);
}

generateHTML(pugFile)

const svgFontPath = path.resolve('./docs/fonts/font.svg');
const ttfFontPath = path.resolve('./docs/fonts/font.ttf');

const ttf = svg2ttf(fs.readFileSync(svgFontPath, 'utf8'), {});
fs.writeFileSync(ttfFontPath, Buffer.from(ttf.buffer));

const ttfData = fs.readFileSync(ttfFontPath);
fs.writeFileSync('./docs/fonts/font.woff2', ttf2woff2(ttfData));