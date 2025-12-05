#!/usr/bin/env node

/**
 * Upload translated files to GitHub
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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
            resolve(null);
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

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN || '';
  const owner = process.argv[3] || 'IDGAF-Chain-Dev';
  const repo = process.argv[4] || 'idgaf-chain';

  if (!token) {
    log('Usage: node upload-translated-files.js <github-token>', 'red');
    process.exit(1);
  }

  log('\n📤 Uploading Translated Files to GitHub', 'cyan');
  log('==========================================\n', 'cyan');

  const files = [
    { path: 'README.md', message: 'Translate README to English' },
    { path: 'QUICK_START.md', message: 'Translate QUICK_START to English' },
    { path: 'DEPLOYMENT.md', message: 'Translate DEPLOYMENT to English' },
  ];

  for (const file of files) {
    const filePath = path.join(process.cwd(), file.path);
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`, 'red');
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const encodedContent = Buffer.from(content).toString('base64');

      log(`Uploading: ${file.path}`, 'cyan');
      await uploadFile(token, owner, repo, file.path, encodedContent, file.message);
      log(`  ✅ ${file.path}`, 'green');

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      log(`  ❌ ${file.path}: ${error.message}`, 'red');
    }
  }

  log('\n✨ Upload complete!', 'green');
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

