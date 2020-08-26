import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import 'axios-debug-log';

const log = debug('page-loader');

const makeName = (str, ext = '') => {
  const name = str.split(/[^\w]/g).filter((n) => n).join('-');
  return name.concat(ext);
};

const pageLoader = (urlForDownload, downloadingPath) => {
  const url = new URL(urlForDownload);
  log('requested page:', urlForDownload);
  const pageName = makeName(url.hostname.concat(url.pathname), '.html');
  const fullPathToPage = path.resolve(downloadingPath, pageName);
  const assetNames = [];
  const assetsDirName = makeName(url.hostname.concat(url.pathname), '_files');
  const page = axios.get(url.href)
    .then((response) => {
      const html = response.data;
      const promises = [];
      const $ = cheerio.load(html, { decodeEntities: false });
      const assetTypes = [
        { type: 'img', property: 'src', responseType: 'arraybuffer' },
        { type: 'script', property: 'src', responseType: 'text' },
        { type: 'link', property: 'href', responseType: 'text' },
      ];
      assetTypes.forEach((assetType) => {
        $(assetType.type).each((i, elem) => {
          const assetUrl = new URL($(elem).attr(assetType.property), url);
          if (assetUrl.hostname === url.hostname) {
            const assetExt = path.extname(assetUrl.pathname);
            const assetName = makeName(url.hostname.concat(assetUrl.pathname).replace(assetExt, ''), assetExt);
            promises.push(axios.get(assetUrl.href, { responseType: assetType.responseType }));
            assetNames.push(assetName);
            $(elem).attr(assetType.property, path.join(assetsDirName, assetName));
          }
        });
      });
      const changedHtml = $.html();
      fs.mkdir(path.resolve(downloadingPath, assetsDirName));
      fs.writeFile(fullPathToPage, changedHtml);
      return Promise.all(promises);
    })
    .then((responses) => {
      const promises = [];
      const assetsDirPath = path.resolve(downloadingPath, assetsDirName);
      const assetsData = responses.map((response) => response.data);
      for (let i = 0; i < assetNames.length; i += 1) {
        const fileName = assetNames[i];
        const data = assetsData[i];
        promises.push(fs.writeFile(path.join(assetsDirPath, fileName), data));
      }
      return Promise.all(promises);
    })
    .catch((error) => console.log(error));
  return page;
};

export default pageLoader;
