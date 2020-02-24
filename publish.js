import * as fs from 'fs';
import * as path from 'path';
import pug from 'pug'

const filePath = path.resolve('./views/index.pug');
const html = pug.renderFile(filePath, {pretty: true});
const newFileName = path.resolve('./docs/index.html');
fs.writeFileSync(newFileName, html);
