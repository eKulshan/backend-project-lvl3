import cheerio from 'cheerio';
import path from 'path';
import makeNameFromUrl from './utils.js';

const getAssetLinksMakeThemLocal = (html, requestedUrl, assetDirName) => {
  const $ = cheerio.load(html, { decodeEntities: false });
  const url = new URL(requestedUrl);

  const links = [];

  const tags = [
    { name: 'img', property: 'src', responseType: 'arraybuffer' },
    { name: 'script', property: 'src', responseType: 'text' },
    { name: 'link', property: 'href', responseType: 'text' },
  ];

  tags.forEach(({ name, property, responseType }) => {
    $(name).each((_, elem) => {
      const assetUrl = new URL($(elem).attr(property), url.href);
      if (assetUrl.hostname === url.hostname) {
        const assetName = makeNameFromUrl(assetUrl, 'asset');
        links.push({ link: assetUrl.href, responseType });
        $(elem).attr(property, path.join(assetDirName, assetName));
      }
    });
  });
  return { changedHtml: $.html(), links };
};

export default getAssetLinksMakeThemLocal;
