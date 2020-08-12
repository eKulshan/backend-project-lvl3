#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/index.js';

program
  .name('page-loader')
  .version('0.0.1')
  .description('Downloads page from web')
  .arguments('<url>')
  .option('-o, --output [pathToDownload]', 'define path to download page', process.cwd())
  .action((url) => {
    pageLoader(url, program.output);
  });
program.parse(process.argv);
