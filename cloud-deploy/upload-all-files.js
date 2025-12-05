#!/usr/bin/env node

/**
 * Upload all project files to GitHub
 * Excludes: node_modules, .env, build artifacts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.env',
  'dist',
  'cache',
  'artifacts',
  'coverage',
  '.DS_Store',
  '*.log',
  'node-setup/data',
  'node-setup/ssl',
  'cloud-deploy/.railway',
  '.cursor',
  '.vscode',
];

function shouldIgnore(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(relativePath);
    }
    return relativePath.includes(pattern) || relativePath.startsWith(pattern);
  });
}

function makeRequest(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'IDGAF-Chain-Deploy',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else if (res.statusCode === 404 && method === 'GET') {
            resolve(null); // File doesn't exist
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode === 404 && method === 'GET') {
            resolve(null);
          } else {
            reject(new Error(`Parse Error: ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getFileSha(token, owner, repo, filePath) {
  try {
    const file = await makeRequest('GET', `/repos/${owner}/${repo}/contents/${filePath}`, token);
    return file ? file.sha : null;
  } catch (error) {
    return null;
  }
}

async function uploadFile(token, owner, repo, filePath, content, message) {
  const sha = await getFileSha(token, owner, repo, filePath);
  
  const data = {
    message: message,
    content: content,
  };

  if (sha) {
    data.sha = sha;
  }

  try {
    const result = await makeRequest('PUT', `/repos/${owner}/${repo}/contents/${filePath}`, token, data);
    return result;
  } catch (error) {
    throw error;
  }
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (shouldIgnore(filePath)) {
      return;
    }

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function uploadFiles(token, owner, repo, files) {
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  log(`\n📤 Uploading ${files.length} files...\n`, 'cyan');

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    
    // Skip if already uploaded (Dockerfile, genesis files)
    if (relativePath === 'Dockerfile' || 
        relativePath === 'chain-config/genesis-mainnet.json' ||
        relativePath === 'chain-config/genesis-mainnet-fixed.json') {
      log(`⏭️  Skipping ${relativePath} (already uploaded)`, 'yellow');
      results.skipped.push(relativePath);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const encodedContent = Buffer.from(content).toString('base64');

      log(`[${i + 1}/${files.length}] Uploading: ${relativePath}`, 'blue');

      await uploadFile(
        token,
        owner,
        repo,
        relativePath,
        encodedContent,
        `Add ${relativePath}`
      );

      results.success.push(relativePath);
      log(`  ✅ ${relativePath}`, 'green');

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      log(`  ❌ ${relativePath}: ${error.message}`, 'red');
      results.failed.push({ file: relativePath, error: error.message });
    }
  }

  return results;
}

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN || '';
  const owner = process.argv[3] || 'IDGAF-Chain-Dev';
  const repo = process.argv[4] || 'idgaf-chain';

  log('\n🚀 Upload All Files to GitHub', 'cyan');
  log('==============================\n', 'cyan');
  log(`Repository: ${owner}/${repo}`, 'cyan');
  log(`Token: ${token.substring(0, 10)}...`, 'cyan');

  // Get all files
  log('\n📁 Scanning project files...', 'yellow');
  const allFiles = getAllFiles('.');
  const filesToUpload = allFiles.filter(file => {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
    return !relativePath.startsWith('.') && 
           !relativePath.includes('node_modules') &&
           !relativePath.includes('.env');
  });

  log(`\n✅ Found ${filesToUpload.length} files to upload`, 'green');
  log(`   (Excluding node_modules, .env, build artifacts)\n`, 'yellow');

  // Upload files
  const results = await uploadFiles(token, owner, repo, filesToUpload);

  // Summary
  log('\n📊 Upload Summary', 'cyan');
  log('==================\n', 'cyan');
  log(`✅ Success: ${results.success.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');
  log(`⏭️  Skipped: ${results.skipped.length}`, 'yellow');

  if (results.failed.length > 0) {
    log('\n❌ Failed files:', 'red');
    results.failed.forEach(({ file, error }) => {
      log(`   - ${file}: ${error}`, 'red');
    });
  }

  log(`\n🔗 Repository: https://github.com/${owner}/${repo}`, 'cyan');
  log(`\n✨ Upload complete!`, 'green');
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

