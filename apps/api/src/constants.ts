import { readFileSync } from 'node:fs';
import { SemVer } from 'semver';

// 获取版本
const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))
export const serverVersion = new SemVer(version);
