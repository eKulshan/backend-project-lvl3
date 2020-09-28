import cheerio from 'cheerio';
import path from 'path';
import { makeNameFromUrl } from './utils.js';

const prepareAssets = (html, url, assetDirName) => {
  const $ = cheerio.load(html, { decodeEntities: false });

  const links = [];

  const tags = [
    { tagName: 'img', attrName: 'src' },
    { tagName: 'script', attrName: 'src' },
    { tagName: 'link', attrName: 'href' },
  ];

  tags.forEach(({ tagName, attrName }) => {
    const elements = $(tagName).toArray();
    elements.map((elem) => {
      const assetUrl = new URL($(elem).attr(attrName), url.href);
      return { elem, assetUrl };
    })
      .filter(({ assetUrl }) => assetUrl.host === url.host)
      .forEach(({
        elem, assetUrl,
      }) => {
        const assetName = makeNameFromUrl(assetUrl);
        $(elem).attr(attrName, path.join(assetDirName, assetName));
        links.push({ assetName, assetUrl });
      });
  });

  return { changedHtml: $.html(), links };
};

export default prepareAssets;
