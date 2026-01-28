#!/usr/bin/env node
/**
 * EAS build requires Node 20. Node 22+ hits "ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING"
 * with expo-modules-core. Run: fnm use 20 | nvm use 20
 */
const major = parseInt(process.versions.node.split('.')[0], 10);
if (major >= 22) {
  console.error(
    'EAS build requires Node 20. Node 22+ is incompatible with expo-modules-core.\n' +
      'Use Node 20: fnm use 20 | nvm use 20 | or install from https://nodejs.org (LTS 20.x)'
  );
  process.exit(1);
}
