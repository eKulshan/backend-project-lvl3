import _ from 'lodash';

const formatName = ({ host, pathname }) => {
  const formatedHost = host.split(/[.]/g)
    .join('-');
  const formatedPathname = pathname.split(/[^\w.]/g)
    .join('-');
  return _.trim(formatedHost.concat(formatedPathname), '-');
};

const makeAssetDirName = (url) => `${formatName(url)}_files`;
const makeHtmlName = (url) => `${formatName(url)}.html`;
const makeAssetName = (url) => `${formatName(url)}`;

export { makeAssetName, makeHtmlName, makeAssetDirName };
