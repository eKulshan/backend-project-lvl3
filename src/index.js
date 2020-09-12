import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import Listr from 'listr';
import 'axios-debug-log';

import getAssetsLinksMakeThemLocal from './htmlHandler.js';
import makeNameFromUrl from './utils.js';

const log = debug('page-loader');

const loadAsset = (link, assetDirName) => axios.get(link, { responseType: 'arraybuffer' })
  .then(({ data }) => {
    const assetName = makeNameFromUrl(link, 'asset');
    return fs.writeFile(path.join(assetDirName, assetName), data);
  });

const startAssetsLoading = (links, assetDirPath) => {
  const data = links.map((link) => ({
    title: `${link}`, task: () => loadAsset(link, assetDirPath),
  }));

  const tasks = new Listr(data, { concurrent: true, exitOnError: false });
  return tasks.run();
};

const pageLoader = (requestedUrl, outputDir) => {
  const htmlFileName = makeNameFromUrl(requestedUrl, 'html');
  const htmlFilePath = path.resolve(outputDir, htmlFileName);
  const assetDirName = makeNameFromUrl(requestedUrl, 'assetDir');
  const assetDirPath = path.resolve(outputDir, assetDirName);
  let links;
  let changedHtml;

  return axios.get(requestedUrl)
    .then(({ data: html }) => getAssetsLinksMakeThemLocal(html, requestedUrl, assetDirName))
    .then((result) => {
      ({ links, changedHtml } = result);
      if (links.length === 0) {
        return log(`There is no assets for ${requestedUrl}`);
      }
      return fs.mkdir(assetDirPath, { recursive: true });
    })
    .then(() => fs.writeFile(htmlFilePath, changedHtml, 'utf-8'))
    .then(() => startAssetsLoading(links, assetDirPath))
    .then(() => htmlFileName);
};

export default pageLoader;
