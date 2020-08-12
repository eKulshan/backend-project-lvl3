import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const getFullPath = (pathToDownload, fileName) => path.resolve(
  process.cwd(),
  pathToDownload,
  fileName,
);
const getFileName = (url) => url.split('://').slice(1).toString().replace(/[^\w]/g, '-');

const pageLoader = (url, pathToDownload) => {
  const fileName = `${getFileName(url)}.html`;
  const fullPath = getFullPath(pathToDownload, fileName);
  const page = axios.get(url)
    .then((response) => response.data)
    .then((data) => fs.writeFile(fullPath, data))
    .catch((error) => console.log(error));
  return page;
};

export default pageLoader;
