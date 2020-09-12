import cheerio from 'cheerio';
import path from 'path';
import makeNameFromUrl from './utils.js';

const getAssetLinksMakeThemLocal = (html, requestedUrl, assetDirName) => {
  const $ = cheerio.load(html, { decodeEntities: false });
  const url = new URL(requestedUrl);

  const links = [];

  const tags = [
    { name: 'img', property: 'src' },
    { name: 'script', property: 'src' },
    { name: 'link', property: 'href' },
  ];

  tags.forEach(({ name, property }) => {
    $(name).each((_, elem) => {
      const assetUrl = new URL($(elem).attr(property), url.href);

      if (assetUrl.hostname !== url.hostname) {
        return;
      }

      const assetName = makeNameFromUrl(assetUrl, 'asset');
      links.push(assetUrl.href);
      $(elem).attr(property, path.join(assetDirName, assetName));
    });
  });
  return { changedHtml: $.html(), links };
};

export default getAssetLinksMakeThemLocal;
