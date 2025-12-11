const fs = require('fs');
const vm = require('vm');
const path = require('path');

function loadMerged(appMapPath, pathsPath) {
  const a = fs.readFileSync(appMapPath, 'utf8')
    .replace(/export\s+const\s+appMap\s*=\s*/m, 'const appMap = ');

  let b = fs.readFileSync(pathsPath, 'utf8');
  // remove import of appMap
  b = b.replace(/import\s+\{\s*appMap\s*\}\s+from\s+['"][^'"]+['"];?\n?/, '');
  // replace exports so functions are available
  b = b.replace(/export\s+function\s+/g, 'function ');
  b = b.replace(/export\s+\{\s*getPathsMap\s+as\s+getPathsMapSync\s*\}\s+from/g, '');

  const wrapped = `${a}\n${b}\nmodule.exports = { generatePathsFromAppMap, getPathsMap, matchTemplatePath };`;
  const script = new vm.Script(wrapped, { filename: 'merged-maps.js' });
  const context = vm.createContext({ console, require, module: {}, exports: {} });
  script.runInContext(context);
  return context.module.exports;
}

const root = path.join(__dirname, '..');
const appMapPath = path.join(root, 'src', 'app', 'services', 'maps', 'appRolesStructure.map.js');
const pathsPath = path.join(root, 'src', 'app', 'services', 'maps', 'appPathsStructure.map.js');

try {
  const { getPathsMap } = loadMerged(appMapPath, pathsPath);
  const map = getPathsMap();
  const templatePaths = Object.keys(map);
  const pathCount = templatePaths.length;
  const roleSet = new Set();
  for (const [p, entry] of Object.entries(map)) {
    const v = entry.viewRoles || [];
    const a = entry.actionRoles || [];
    v.forEach(r => r && roleSet.add(String(r)));
    a.forEach(r => r && roleSet.add(String(r)));
  }

  const roleCount = roleSet.size;
  console.log(JSON.stringify({ pathCount, roleCount }));
} catch (err) {
  console.error('error', err && err.stack ? err.stack : err);
  process.exit(2);
}
