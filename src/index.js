import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import Listr from 'listr';
import 'axios-debug-log';

import getAssetsLinksMakeThemLocal from './htmlHandler.js';
import makeNameFromUrl from './utils.js';

const log = debug('page-loader');

const loadAsset = (link, responseType, assetDirName) => axios.get(link, { responseType })
  .then(({ data }) => {
    const assetName = makeNameFromUrl(link, 'asset');
    return fs.writeFile(path.join(assetDirName, assetName), data);
  });

const startAssetsLoading = (links, assetDirPath) => {
  const data = links.map(({ link, responseType }) => ({
    title: `${link}`, task: () => loadAsset(link, responseType, assetDirPath),
  }));

  const tasks = new Listr(data, { concurrent: true, exitOnError: false });
  return tasks.run();
};

const pageLoader = (requestedUrl, outputDir) => {
  const htmlFileName = makeNameFromUrl(requestedUrl, 'html');
  const htmlFilePath = path.resolve(outputDir, htmlFileName);
  const assetDirName = makeNameFromUrl(requestedUrl, 'assetDir');
  const assetDirPath = path.resolve(outputDir, assetDirName);

  return axios.get(requestedUrl)
    .then(({ data: html }) => getAssetsLinksMakeThemLocal(html, requestedUrl, assetDirName))
    .then(({ links, changedHtml }) => fs.writeFile(htmlFilePath, changedHtml, 'utf-8')
      .then(() => {
        if (links.length === 0) {
          return log(`There is no assets for ${requestedUrl}`);
        }
        log(`Assets links to download: ${links}`);
        log(`Assets folder ${assetDirName} was created in ${outputDir}`);
        return fs.mkdir(assetDirPath)
          .then(() => startAssetsLoading(links, assetDirPath));
      })
      .then(() => htmlFileName))
    .catch((e) => {
      throw new Error(`Download failed. Reason: ${e.message}`);
    });
};

export default pageLoader;
