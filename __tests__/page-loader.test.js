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

let expected;
let tempDir;
beforeAll(async () => {
  expected = await fs.readFile(getFixturePath('page-loader-testpage.html'), 'utf-8');
});

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('page-loader succsses', async () => {
  nock('https://hexlet.io')
    .get('/courses')
    .reply(200, expected);
  const url = 'https://hexlet.io/courses';
  await pageLoader(url, tempDir);
  const actual = await fs.readFile(path.join(tempDir, 'hexlet-io-courses.html'), 'utf-8');
  expect(actual).toBe(expected);
});

afterEach(async () => {
  fs.rmdir(tempDir, { recursive: true });
});
