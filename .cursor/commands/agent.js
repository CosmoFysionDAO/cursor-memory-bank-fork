#!/usr/bin/env node
/**
 * Security Agent Mode — CLI for /agent command.
 * Usage: node agent.js <init|audit|update-rules|check>
 * Exit: 0 OK, 1 critical issues (for check) or error.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MEMORY_BANK = path.join(ROOT, 'memory-bank');
const AUDIT_DIR = path.join(MEMORY_BANK, 'audit');
const RULES_DIR = path.join(ROOT, '.cursor', 'rules');
const TEMPLATES_DIR = path.join(ROOT, '.cursor', 'templates');

// --- Secret / vulnerability patterns (regex source strings) ---
const SECRET_PATTERNS = [
  { name: 'api_key', re: /api[_-]?key\s*=\s*['"][A-Za-z0-9_]{16,}['"]/gi },
  { name: 'password', re: /password\s*=\s*['"][^'"]{8,}['"]/gi },
  { name: 'secret', re: /secret\s*=\s*['"][^'"]+['"]/gi },
  { name: 'aws_or_token', re: /(aws_access_key|aws_secret|token)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{20,}/gi },
];
const DANGEROUS_EXEC = [
  { name: 'exec_interpolation', re: /exec\.(Command|CommandContext)\s*\([^)]*\+/ },
];

function readFileSafe(p, enc = 'utf8') {
  try {
    return fs.readFileSync(p, enc);
  } catch (_) {
    return null;
  }
}

function writeFileSafe(p, content) {
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf8');
    return true;
  } catch (e) {
    console.error('Write error:', p, e.message);
    return false;
  }
}

function listFiles(dir, extOrFilter, base = dir) {
  let out = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = path.relative(base, full);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'vendor') continue;
        out = out.concat(listFiles(full, extOrFilter, base));
      } else if (e.isFile()) {
        if (typeof extOrFilter === 'function' ? extOrFilter(rel) : rel.endsWith(extOrFilter || '')) {
          out.push(full);
        }
      }
    }
  } catch (_) {}
  return out;
}

function shouldIgnore(relPath, ignoreLines) {
  const n = relPath.replace(/\\/g, '/');
  for (const line of ignoreLines) {
    const t = line.replace(/^\s+|\s+$/g, '').replace(/^#.*$/, '').trim();
    if (!t) continue;
    if (t.startsWith('**') && n.includes(t.slice(2).replace(/\*\*$/, ''))) return true;
    if (t.endsWith('/') && (n === t.slice(0, -1) || n.startsWith(t))) return true;
    if (n === t || n.endsWith(t) || n.includes(t)) return true;
    const glob = t.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    if (new RegExp(glob).test(n)) return true;
  }
  return false;
}

function loadIgnoreLines(root, filename) {
  const p = path.join(root, filename);
  const c = readFileSafe(p);
  if (!c) return [];
  return c.split(/\r?\n/);
}

function scanForSecrets(rootDir, ignoreLines) {
  const results = [];
  const exts = ['.js', '.ts', '.go', '.py', '.java', '.yaml', '.yml', '.json', '.env', '.tf', '.md'];
  const files = listFiles(rootDir, (rel) => exts.some(ext => rel.endsWith(ext)) || rel === '.env');
  for (const file of files) {
    const rel = path.relative(rootDir, file);
    if (shouldIgnore(rel, ignoreLines)) continue;
    const content = readFileSafe(file);
    if (!content) continue;
    for (const { name, re } of SECRET_PATTERNS) {
      const matches = content.match(re);
      if (matches) {
        const lines = content.split(/\r?\n/);
        const lineIndex = lines.findIndex(l => re.test(l));
        results.push({
          file: rel,
          line: lineIndex >= 0 ? lineIndex + 1 : 1,
          pattern: name,
          severity: 'high',
        });
      }
    }
  }
  return results;
}

function scanDangerousExec(rootDir, ignoreLines) {
  const results = [];
  const files = listFiles(rootDir, (rel) => /\.(go|js|ts)$/.test(rel));
  for (const file of files) {
    const rel = path.relative(rootDir, file);
    if (shouldIgnore(rel, ignoreLines)) continue;
    const content = readFileSafe(file);
    if (!content) continue;
    for (const { name, re } of DANGEROUS_EXEC) {
      const match = content.match(re);
      if (match) {
        const lineNum = content.slice(0, match.index).split(/\r?\n/).length;
        results.push({ file: rel, line: lineNum, pattern: name, severity: 'high' });
      }
    }
  }
  return results;
}

function runCheck(rootDir) {
  const gitignore = loadIgnoreLines(rootDir, '.gitignore');
  const agentignore = loadIgnoreLines(rootDir, '.agentignore');
  const ignore = [...agentignore, ...gitignore].filter(Boolean);
  const secretFindings = scanForSecrets(rootDir, ignore);
  const execFindings = scanDangerousExec(rootDir, ignore);
  const all = [...secretFindings, ...execFindings];
  const critical = all.filter(f => f.severity === 'high');
  return { all, critical };
}

// --- Subcommand: init ---
function cmdInit() {
  const agentMd = path.join(ROOT, 'AGENT.md');
  const agentignorePath = path.join(ROOT, '.agentignore');
  const templatePath = path.join(TEMPLATES_DIR, 'agent_template.md');
  const defaultsPath = path.join(TEMPLATES_DIR, 'agentignore_defaults.md');

  if (!readFileSafe(agentMd)) {
    const tpl = readFileSafe(templatePath) || `# AGENT.md — Security Agent Mode\n## Version\n1.0\n## Purpose\nРежим безопасности агента.\n## Agent behavior rules\n- Использовать .agentignore.\n- Не вставлять секреты в код.\n## Audit reports\n(Заполняется после /agent audit.)\n`;
    writeFileSafe(agentMd, tpl);
    console.log('Created AGENT.md');
  } else {
    console.log('AGENT.md already exists');
  }

  if (!readFileSafe(agentignorePath)) {
    const defaults = readFileSafe(defaultsPath);
    const lines = defaults ? defaults.split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim()).filter(l => l && !l.startsWith('#')) : [];
    const content = [
      'node_modules/',
      '.git/',
      'secrets.yaml',
      'secrets.yml',
      '*.log',
      '.env',
      '.env.*',
      '**/credentials.json',
      '**/secrets/**',
      '**/*.key',
      '**/*.pem',
    ].filter(Boolean).join('\n');
    writeFileSafe(agentignorePath, content);
    console.log('Created .agentignore');
  } else {
    console.log('.agentignore already exists');
  }

  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  console.log('Ensured memory-bank/audit/ exists');

  const gitignore = loadIgnoreLines(ROOT, '.gitignore');
  const agentignore = loadIgnoreLines(ROOT, '.agentignore');
  const findings = scanForSecrets(ROOT, [...agentignore, ...gitignore]);
  if (findings.length) {
    console.log('\nPotential secrets found (consider adding these paths to .agentignore):');
    const byFile = {};
    findings.forEach(f => { byFile[f.file] = (byFile[f.file] || 0) + 1; });
    Object.entries(byFile).forEach(([f, c]) => console.log('  -', f, `(${c} hit(s))`));
  }

  const activePath = path.join(MEMORY_BANK, 'activeContext.md');
  let active = readFileSafe(activePath) || '';
  const entry = `\n## Agent mode init\n- ${new Date().toISOString().slice(0, 10)}: Security Agent Mode initialized (AGENT.md, .agentignore, audit/).\n`;
  if (!active.includes('Agent mode init')) {
    active = active + entry;
    writeFileSafe(activePath, active);
    console.log('Updated memory-bank/activeContext.md');
  }
  return 0;
}

// --- Subcommand: check ---
function cmdCheck() {
  const { all, critical } = runCheck(ROOT);
  if (all.length) {
    console.log('Findings:');
    all.forEach(f => console.log(`  [${f.severity}] ${f.file}:${f.line} (${f.pattern})`));
  } else {
    console.log('No issues found.');
  }
  return critical.length ? 1 : 0;
}

// --- Subcommand: audit (writes report files and progress) ---
function cmdAudit() {
  const gitignore = loadIgnoreLines(ROOT, '.gitignore');
  const agentignore = loadIgnoreLines(ROOT, '.agentignore');
  const ignore = [...agentignore, ...gitignore];

  const secretFindings = scanForSecrets(ROOT, ignore);
  const execFindings = scanDangerousExec(ROOT, ignore);

  const report = [];
  report.push(`# Security Audit — ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`);
  report.push('');
  report.push('## Static analysis (code)');
  report.push('');
  [...secretFindings, ...execFindings].forEach(f => {
    report.push(`- **${f.severity}** \`${f.file}\`:${f.line} — ${f.pattern}`);
  });
  report.push('');
  report.push('## Dependencies');
  report.push('- (Run with network access for OSV/API checks, or run /agent audit in Cursor for full analysis.)');
  report.push('');
  report.push('## Configurations (Dockerfile, docker-compose, Terraform)');
  report.push('- (Full config audit is performed by the /agent audit command in Cursor.)');
  report.push('');

  const ts = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const auditFile = path.join(AUDIT_DIR, `audit-${ts}.md`);
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  writeFileSafe(auditFile, report.join('\n'));
  console.log('Written', auditFile);

  const agentMdPath = path.join(ROOT, 'AGENT.md');
  let agentContent = readFileSafe(agentMdPath) || '';
  const auditSection = '\n## Last audit\n- Date: ' + new Date().toISOString().slice(0, 10) + '\n- Report: memory-bank/audit/audit-' + ts + '.md\n- Findings: ' + (secretFindings.length + execFindings.length) + ' (static)\n';
  agentContent = agentContent.trimEnd() + auditSection;
  writeFileSafe(agentMdPath, agentContent);
  console.log('Updated AGENT.md with audit summary');

  const progressPath = path.join(MEMORY_BANK, 'progress.md');
  let progress = readFileSafe(progressPath) || '';
  const progressEntry = `\n- ${new Date().toISOString().slice(0, 10)}: Security audit completed (static). Report: memory-bank/audit/audit-${ts}.md. Findings: ${secretFindings.length + execFindings.length}.\n`;
  progress = progress + progressEntry;
  writeFileSafe(progressPath, progress);
  console.log('Updated memory-bank/progress.md');

  const criticalCount = [...secretFindings, ...execFindings].filter(f => f.severity === 'high').length;
  if (criticalCount > 0) {
    const activePath = path.join(MEMORY_BANK, 'activeContext.md');
    let active = readFileSafe(activePath) || '';
    const focus = `\n- **Security:** ${criticalCount} high-severity finding(s) from /agent audit. See memory-bank/audit/audit-${ts}.md.\n`;
    if (!active.includes('Security:**')) active = active + focus;
    writeFileSafe(activePath, active);
  }

  return 0;
}

// --- Subcommand: update-rules ---
function cmdUpdateRules() {
  let latestAudit = null;
  let latestTs = '';
  try {
    const names = fs.readdirSync(AUDIT_DIR).filter(n => n.startsWith('audit-') && n.endsWith('.md'));
    names.sort().reverse();
    if (names.length) {
      latestTs = names[0].replace('audit-', '').replace('.md', '');
      latestAudit = readFileSafe(path.join(AUDIT_DIR, names[0]));
    }
  } catch (_) {}
  if (!latestAudit) {
    console.log('No audit report found in memory-bank/audit/. Run /agent audit first.');
    return 0;
  }

  const findings = [];
  const lineRe = /^\s*-\s*\*\*(high|medium|low)\*\*\s*`([^`]+)`:(\d+)\s*—\s*(.+)/;
  latestAudit.split(/\r?\n/).forEach(line => {
    const m = line.match(lineRe);
    if (m) findings.push({ severity: m[1], file: m[2], line: parseInt(m[3], 10), pattern: m[4] });
  });

  const byPattern = {};
  findings.forEach(f => {
    const key = f.pattern;
    if (!byPattern[key]) byPattern[key] = [];
    byPattern[key].push(f);
  });

  const rulesPath = path.join(RULES_DIR, 'isolation_rules');
  const securityRulePath = path.join(rulesPath, 'Core', 'agent-security.mdc');
  fs.mkdirSync(path.dirname(securityRulePath), { recursive: true });

  const patterns = SECRET_PATTERNS.map(p => `  - "${p.re.source.replace(/\\/g, '\\\\')}"`);
  const content = `---
description: "Security rules derived from agent audit. Avoid hardcoded secrets and unsafe exec."
globs: "**/*"
alwaysApply: false
---
# Agent Security Rules (from /agent update-rules)

- Do not add hardcoded API keys, passwords, or secrets. Use environment variables or placeholders.
- Avoid exec.Command/exec.CommandContext with string interpolation; use structured args.
- Follow AGENT.md and .agentignore for sensitive paths.
`;
  writeFileSafe(securityRulePath, content);
  console.log('Written', securityRulePath);

  const decisionPath = path.join(MEMORY_BANK, 'decisionLog.md');
  let decision = readFileSafe(decisionPath) || '';
  const logEntry = `\n- ${new Date().toISOString().slice(0, 10)}: /agent update-rules. Updated .cursor/rules (agent-security.mdc) based on audit-${latestTs}.md. Recurring patterns: ${Object.keys(byPattern).join(', ')}.\n`;
  decision = decision + logEntry;
  writeFileSafe(decisionPath, decision);
  console.log('Updated memory-bank/decisionLog.md');

  return 0;
}

// --- Main ---
function main() {
  const sub = (process.argv[2] || '').toLowerCase();
  if (!['init', 'audit', 'update-rules', 'check'].includes(sub)) {
    console.log('Usage: node agent.js <init|audit|update-rules|check>');
    console.log('  init         - Create AGENT.md, .agentignore, ensure audit/');
    console.log('  audit        - Run security audit, write report to memory-bank/audit/');
    console.log('  update-rules - Update .cursor/rules from latest audit');
    console.log('  check        - Quick check; exit 1 if critical issues found');
    process.exit(sub ? 1 : 0);
    return;
  }

  let code = 0;
  switch (sub) {
    case 'init':   code = cmdInit(); break;
    case 'check':  code = cmdCheck(); break;
    case 'audit':  code = cmdAudit(); break;
    case 'update-rules': code = cmdUpdateRules(); break;
    default: code = 0;
  }
  process.exit(code);
}

main();
