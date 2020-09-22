import cheerio from 'cheerio';
import path from 'path';
import { makeAssetName } from './utils.js';

const getAssetLinksMakeThemLocal = (html, url, assetDirName) => {
  const $ = cheerio.load(html, { decodeEntities: false });

  const links = [];

  const tags = [
    { name: 'img', property: 'src' },
    { name: 'script', property: 'src' },
    { name: 'link', property: 'href' },
  ];

  tags.forEach(({ name, property }) => {
    const unfilteredLinks = [];
    $(name).each((_, elem) => unfilteredLinks.push({ elem }));
    unfilteredLinks.map(({ elem }) => {
      const assetUrl = new URL($(elem).attr(property), url.href);
      const assetName = makeAssetName(assetUrl);
      return { elem, assetName, assetUrl };
    })
      .filter(({ assetUrl }) => assetUrl.host === url.host)
      .map(({
        elem, assetName, assetUrl,
      }) => {
        $(elem).attr(property, path.join(assetDirName, assetName));
        return links.push({ assetName, assetUrl });
      });
  });

  return { changedHtml: $.html(), links };
};

export default getAssetLinksMakeThemLocal;
