import path from 'path';
import { loadManagerOrAddonsFile } from '../utils/load-manager-or-addons-file';

import createDevConfig from './manager-webpack.config';

export async function managerWebpack(_, options) {
  const { presets = '../../client/manager' } = options;
  const refs = await presets.apply('refs', [], options);

  return createDevConfig({ ...options, refs });
}

export async function managerEntries(installedAddons, options) {
  const { presets, configDir, managerEntry = '../../client/manager' } = options;
  const entries = [require.resolve('../common/polyfills')];
  const refs = await presets.apply('refs', [], options);

  if (installedAddons && installedAddons.length) {
    entries.push(...installedAddons);
  }

  if (refs) {
    entries.push(path.resolve(path.join(configDir, `generated-refs.js`)));
  }

  entries.push(require.resolve(managerEntry));

  const managerConfig = loadManagerOrAddonsFile(options);
  if (managerConfig) {
    entries.push(managerConfig);
  }

  return entries;
}

export * from '../common/common-preset';
