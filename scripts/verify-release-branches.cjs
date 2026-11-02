const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/release-plan.json'), 'utf8'));
const runRoot = path.join(root, '.release-validation', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(runRoot, { recursive: true });
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
const results = [];
let previous = plan.base;
const expectedTabs = [];

function materialize(ref, destination) {
  const entries = git(['ls-tree', '-r', '-z', ref]).split('\0').filter(Boolean).map(line => {
    const [metadata, file] = line.split('\t');
    const [mode, kind, oid] = metadata.split(' ');
    if (kind !== 'blob' || mode === '120000') throw new Error(`Unsupported Git entry: ${file}`);
    return { file, oid };
  });
  const blobs = execFileSync('git', ['cat-file', '--batch'], { cwd: root, input: entries.map(entry => entry.oid).join('\n') + '\n', maxBuffer: 128 * 1024 * 1024 });
  let offset = 0;
  for (const entry of entries) {
    const newline = blobs.indexOf(10, offset);
    const header = blobs.subarray(offset, newline).toString('utf8').split(' ');
    const size = Number(header[2]);
    if (header[1] !== 'blob' || !Number.isFinite(size)) throw new Error('Invalid Git object stream');
    const destinationFile = path.resolve(destination, entry.file);
    const relative = path.relative(destination, destinationFile);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Git entry escapes validation directory');
    fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
    fs.writeFileSync(destinationFile, blobs.subarray(newline + 1, newline + 1 + size));
    offset = newline + 1 + size + 1;
  }
}

try {
  for (const step of plan.steps) {
    git(['merge-base', '--is-ancestor', previous, step.branch]);
    if (step.tab) expectedTabs.push(step.tab);
    const folder = path.join(runRoot, step.branch.replace('codex/', ''));
    fs.mkdirSync(folder, { recursive: true });
    materialize(step.branch, folder);
    const exports = {};
    const registry = fs.readFileSync(path.join(folder, 'src/features/releaseTabs.ts'), 'utf8');
    new Function('exports', ts.transpileModule(registry, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports);
    if (JSON.stringify(exports.releasedTabs) !== JSON.stringify(expectedTabs)) throw new Error(`${step.branch}: unexpected installed tabs`);
    const futureFiles = plan.steps.slice(plan.steps.indexOf(step) + 1).flatMap(next => next.files);
    for (const file of futureFiles) {
      if (fs.existsSync(path.join(folder, file))) throw new Error(`${step.branch}: future module already present: ${file}`);
    }
    for (const file of step.files) {
      if (!fs.existsSync(path.join(folder, file))) throw new Error(`${step.branch}: feature file missing: ${file}`);
    }
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(folder, 'node_modules'), 'junction');
    const checks = [
      ['typecheck', path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit'],
      ['build', path.join(root, 'node_modules/vite/bin/vite.js'), 'build'],
    ];
    for (const [name, binary, ...args] of checks) {
      const result = spawnSync(process.execPath, [binary, ...args], { cwd: folder, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 180000 });
      const output = (result.stdout || '') + (result.stderr || '') + (result.error ? String(result.error) : '');
      fs.writeFileSync(path.join(folder, `${name}.log`), output);
      if (result.status !== 0) throw new Error(`${step.branch}: ${name} failed\n${output.slice(-6000)}`);
    }
    results.push({ branch: step.branch, commit: git(['rev-parse', step.branch]), tabs: [...expectedTabs], typecheck: 'passed', build: 'passed' });
    console.log(`[${results.length}/${plan.steps.length}] ${step.branch}: typecheck and build passed`);
    previous = step.branch;
  }
  const test = spawnSync(process.execPath, [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--dir', 'src'], { cwd: path.join(runRoot, plan.steps.at(-1).branch.replace('codex/', '')), encoding: 'utf8', timeout: 120000 });
  fs.writeFileSync(path.join(runRoot, 'tests.log'), (test.stdout || '') + (test.stderr || ''));
  if (test.status !== 0) throw new Error('Final release tests failed; see tests.log');
  fs.writeFileSync(path.join(root, '.release-validation/report.json'), JSON.stringify({ status: 'passed', runRoot, tests: 'passed', results }, null, 2));
  console.log(`All ${results.length} release branches passed. Report: .release-validation/report.json`);
} catch (error) {
  fs.writeFileSync(path.join(root, '.release-validation/report.json'), JSON.stringify({ status: 'failed', runRoot, results, error: String(error) }, null, 2));
  console.error(String(error));
  process.exitCode = 1;
}
