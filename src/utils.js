import _ from 'lodash';

const makeNameFromUrl = ({ host, pathname }) => {
  const formatedHost = host.replace(/[.]/g, '-');
  const formatedPathname = pathname.replace(/[^\w.]/g, '-');
  return _.trim(formatedHost.concat(formatedPathname), '-');
};

const makeAssetDirName = (url) => `${makeNameFromUrl(url)}_files`;
const makeHtmlName = (url) => `${makeNameFromUrl(url)}.html`;

export { makeHtmlName, makeAssetDirName, makeNameFromUrl };
