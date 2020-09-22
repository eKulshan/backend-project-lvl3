#!/usr/bin/env node

import program from 'commander';
import downloadPage from '../src/index.js';

program
  .name('page-loader')
  .version('0.0.1')
  .description('Downloads page from web')
  .arguments('<url>')
  .option('-o, --output [pathToDownload]', 'define path to download page', process.cwd())
  .action((url) => {
    downloadPage(url, program.output)
      .then((htmlFileName) => console.log(`Page was downloaded as ${htmlFileName} in ${program.output}`))
      .catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  });
program.parse(process.argv);
