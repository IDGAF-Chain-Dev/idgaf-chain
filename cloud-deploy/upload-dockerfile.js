#!/usr/bin/env node

/**
 * Upload Dockerfile to GitHub using GitHub API
 * 
 * Usage:
 *   node upload-dockerfile.js <github-token> <owner> <repo>
 * 
 * Example:
 *   node upload-dockerfile.js ghp_xxx IDGAF-Chain-Dev idgaf-chain
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
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${body}`));
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
    return file.sha;
  } catch (error) {
    // File doesn't exist
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
    data.sha = sha; // Update existing file
  }

  try {
    const result = await makeRequest('PUT', `/repos/${owner}/${repo}/contents/${filePath}`, token, data);
    return result;
  } catch (error) {
    throw error;
  }
}

async function main() {
  const token = process.argv[2];
  const owner = process.argv[3] || 'IDGAF-Chain-Dev';
  const repo = process.argv[4] || 'idgaf-chain';

  if (!token) {
    log('Usage: node upload-dockerfile.js <github-token> [owner] [repo]', 'red');
    log('Example: node upload-dockerfile.js ghp_xxx IDGAF-Chain-Dev idgaf-chain', 'yellow');
    log('\nTo get GitHub token:', 'cyan');
    log('1. Go to https://github.com/settings/tokens', 'yellow');
    log('2. Click "Generate new token (classic)"', 'yellow');
    log('3. Select "repo" scope', 'yellow');
    log('4. Copy the token', 'yellow');
    process.exit(1);
  }

  log('\n📤 Uploading Dockerfile to GitHub', 'cyan');
  log('==================================\n', 'cyan');

  // Read Dockerfile
  const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    log(`❌ Dockerfile not found at: ${dockerfilePath}`, 'red');
    process.exit(1);
  }

  const content = fs.readFileSync(dockerfilePath, 'utf8');
  const encodedContent = Buffer.from(content).toString('base64');

  log(`Repository: ${owner}/${repo}`, 'cyan');
  log(`File: Dockerfile`, 'cyan');
  log(`\n⏳ Uploading...`, 'yellow');

  try {
    const result = await uploadFile(
      token,
      owner,
      repo,
      'Dockerfile',
      encodedContent,
      'Add Dockerfile for Render deployment'
    );

    log('\n✅ Dockerfile uploaded successfully!', 'green');
    log(`\n📄 File URL: ${result.content.html_url}`, 'cyan');
    log(`\n🔗 Repository: https://github.com/${owner}/${repo}`, 'cyan');
    log(`\n✨ Next steps:`, 'yellow');
    log('1. Go to Render dashboard', 'yellow');
    log('2. Update Dockerfile Path to: Dockerfile', 'yellow');
    log('3. Deploy!', 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    
    if (error.message.includes('401')) {
      log('\n💡 Invalid token. Please check:', 'yellow');
      log('1. Token is correct', 'yellow');
      log('2. Token has "repo" scope', 'yellow');
      log('3. Token is not expired', 'yellow');
    } else if (error.message.includes('404')) {
      log('\n💡 Repository not found. Please check:', 'yellow');
      log(`1. Repository exists: https://github.com/${owner}/${repo}`, 'yellow');
      log('2. You have write access', 'yellow');
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

