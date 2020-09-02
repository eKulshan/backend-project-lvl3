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

let html;
let expectedHTML;
let expectedJPG;
let expectedJS;
let expectedCSS;
let tempDir;

beforeAll(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  html = await fs.readFile(getFixturePath('mypage.html'), 'utf-8');
  expectedHTML = await fs.readFile(getFixturePath('mypageDownloaded.html'), 'utf-8');
  expectedJS = await fs.readFile(getFixturePath('./assets/script.js'), 'utf-8');
  expectedCSS = await fs.readFile(getFixturePath('./assets/style.css'), 'utf-8');
  expectedJPG = await fs.readFile(getFixturePath('./assets/logo.jpg'));
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
  expect(actualHTML).toBe(expectedHTML);
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

test('fs access fail', async () => {
  nock('https://mypage.ru')
    .get('/')
    .reply(200, html);
  const url = 'https://mypage.ru/';
  await expect(pageLoader(url, tempDir)).rejects.toThrow();
});

afterAll(async () => {
  fs.rmdir(tempDir, { recursive: true });
});
