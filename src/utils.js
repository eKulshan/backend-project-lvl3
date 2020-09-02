import path from 'path';

const formatName = (str) => str.split(/[^\w]/g).filter((n) => n).join('-');

const makeNameFromUrl = (url, fileType) => {
  const types = {
    assetDir: ({ host, pathname }) => `${formatName(path.join(host, pathname))}_files`,
    html: ({ host, pathname }) => `${formatName(path.join(host, pathname))}.html`,
    asset: ({ host, pathname }) => {
      const assetExt = path.extname(pathname);
      return formatName(path.join(host, pathname).replace(assetExt, '')).concat(assetExt);
    },
  };
  return types[fileType](new URL(url));
};

export default makeNameFromUrl;
