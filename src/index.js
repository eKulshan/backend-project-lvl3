import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import Listr from 'listr';
import 'axios-debug-log';

import getAssetsLinksMakeThemLocal from './htmlHandler.js';
import { makeAssetDirName, makeHtmlName } from './utils.js';

const log = debug('page-loader');

const downloadAsset = (assetName, link, assetDirName) => axios.get(link.href, { responseType: 'arraybuffer' })
  .then(({ data }) => fs.writeFile(path.join(assetDirName, assetName), data));

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
  const assetDirName = makeAssetDirName(url);
  const assetDirPath = path.resolve(outputDir, assetDirName);
  let links;
  let changedHtml;

  return axios.get(url.href)
    .then(({ data: html }) => {
      ({ links, changedHtml } = getAssetsLinksMakeThemLocal(html, url, assetDirName));
      if (links.length === 0) {
        return log(`There is no assets for ${url}`);
      }
      return fs.mkdir(assetDirPath, { recursive: true });
    })
    .then(() => fs.writeFile(htmlFilePath, changedHtml, 'utf-8'))
    .then(() => downloadAssets(links, assetDirPath))
    .then(() => htmlFileName);
};

export default downloadPage;
