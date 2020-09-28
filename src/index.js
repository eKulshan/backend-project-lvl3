import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import Listr from 'listr';
import 'axios-debug-log';

import prepareAssets from './prepareAssets.js';
import { makeAssetDirName, makeHtmlName } from './utils.js';

const log = debug('page-loader');

const downloadAsset = (assetName, assetUrl, assetDirName) => axios.get(assetUrl.href, { responseType: 'arraybuffer' })
  .then(({ data }) => {
    const assetLoadingPath = path.join(assetDirName, assetName);
    log(`Asset loading from ${assetUrl.href} to ${assetLoadingPath}`);
    return fs.writeFile(assetLoadingPath, data);
  });

const downloadAssets = (links, assetDirPath) => {
  const data = links.map(({ assetName, assetUrl }) => ({
    title: `${assetUrl}`, task: () => downloadAsset(assetName, assetUrl, assetDirPath),
  }));

  const tasks = new Listr(data, { concurrent: true, exitOnError: false });
  return tasks.run();
};

const downloadPage = (requestedUrl, outputDir) => {
  const url = new URL(requestedUrl);
  const htmlFileName = makeHtmlName(url);
  const htmlFilePath = path.resolve(outputDir, htmlFileName);
  log(`HtmlFileName: ${htmlFileName}
  DownloadPath: ${htmlFilePath}`);
  const assetDirName = makeAssetDirName(url);
  const assetDirPath = path.resolve(outputDir, assetDirName);
  let links;
  let changedHtml;

  return axios.get(url.href)
    .then(({ data: html }) => {
      ({ links, changedHtml } = prepareAssets(html, url, assetDirName));
      return fs.mkdir(assetDirPath, { recursive: true });
    })
    .then(() => fs.writeFile(htmlFilePath, changedHtml, 'utf-8'))
    .then(() => downloadAssets(links, assetDirPath))
    .then(() => htmlFileName);
};

export default downloadPage;
