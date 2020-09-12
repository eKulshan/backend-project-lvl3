/**
 * @jest-environment node
 */
import fs from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import nock from 'nock';
import pageLoader from '../src/index.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url); // eslint-disable-line no-underscore-dangle
const __dirname = dirname(__filename); // eslint-disable-line no-underscore-dangle
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const html = `<html><head><script src="assets/script.js"></script>
  <link rel="stylesheet" href="assets/style.css">
  </head><body><img src='assets/logo.jpg' width="200" height="200" alt="Логотип">
  <img src="https://pbs.twimg.com/media/CFSYsJoWgAAN9OY.jpg" width="200" height="200" alt="Логотип"></body></html>`;
const expectedHtml = `<html><head><script src="mypage-ru_files/mypage-ru-assets-script.js"></script>
  <link rel="stylesheet" href="mypage-ru_files/mypage-ru-assets-style.css">
  </head><body><img src="mypage-ru_files/mypage-ru-assets-logo.jpg" width="200" height="200" alt="Логотип">
  <img src="https://pbs.twimg.com/media/CFSYsJoWgAAN9OY.jpg" width="200" height="200" alt="Логотип"></body></html>`;
const expectedJS = 'some javascript code';
const expectedCSS = 'some css code';

let expectedJPG;
let tempDir;

beforeAll(async () => {
  expectedJPG = await fs.readFile(getFixturePath('./assets/logo.jpg'));
});

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('load page with assets', async () => {
  nock('https://mypage.ru')
    .get('/')
    .reply(200, html)
    .get('/assets/script.js')
    .reply(200, expectedJS)
    .get('/assets/style.css')
    .reply(200, expectedCSS)
    .get('/assets/logo.jpg')
    .reply(200, expectedJPG);
  const url = 'https://mypage.ru/';
  await pageLoader(url, tempDir);
  const actualHTML = await fs.readFile(path.join(tempDir, 'mypage-ru.html'), 'utf-8');
  const actualJS = await fs.readFile(path.join(tempDir, 'mypage-ru_files', 'mypage-ru-assets-script.js'), 'utf-8');
  const actualCSS = await fs.readFile(path.join(tempDir, 'mypage-ru_files', 'mypage-ru-assets-style.css'), 'utf-8');
  const actualJPG = await fs.readFile(path.join(tempDir, 'mypage-ru_files', 'mypage-ru-assets-logo.jpg'));
  expect(actualHTML).toBe(expectedHtml);
  expect(actualJS).toBe(expectedJS);
  expect(actualCSS).toBe(expectedCSS);
  expect(actualJPG).toEqual(expectedJPG);
});

test('http request fail', async () => {
  nock('https://mypage.ru')
    .get('/nonExistentPage')
    .reply(404);
  const url = 'https://mypage.ru/nonExistentPage';
  await expect(pageLoader(url, tempDir)).rejects.toThrow();
});
