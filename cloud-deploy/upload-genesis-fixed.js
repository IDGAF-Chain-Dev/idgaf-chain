#!/usr/bin/env node

/**
 * Upload fixed genesis-mainnet.json to GitHub
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

  log('\n📤 Uploading fixed genesis file to GitHub', 'cyan');
  log('==========================================\n', 'cyan');

  // Read fixed genesis file
  const genesisPath = path.join(__dirname, '..', 'chain-config', 'genesis-mainnet-fixed.json');
  if (!fs.existsSync(genesisPath)) {
    log(`❌ File not found: ${genesisPath}`, 'red');
    process.exit(1);
  }

  const content = fs.readFileSync(genesisPath, 'utf8');
  const encodedContent = Buffer.from(content).toString('base64');

  log(`Repository: ${owner}/${repo}`, 'cyan');
  log(`File: chain-config/genesis-mainnet-fixed.json`, 'cyan');
  log(`\n⏳ Uploading...`, 'yellow');

  try {
    // Upload fixed genesis file
    const result1 = await uploadFile(
      token,
      owner,
      repo,
      'chain-config/genesis-mainnet-fixed.json',
      encodedContent,
      'Add fixed genesis file without cancunTime'
    );

    log('\n✅ Fixed genesis file uploaded!', 'green');
    log(`📄 File URL: ${result1.content.html_url}`, 'cyan');

    // Also update the main genesis-mainnet.json
    const mainGenesisPath = path.join(__dirname, '..', 'chain-config', 'genesis-mainnet.json');
    const mainContent = fs.readFileSync(mainGenesisPath, 'utf8');
    const fixedContent = content; // Use the fixed version
    const mainEncoded = Buffer.from(fixedContent).toString('base64');

    const result2 = await uploadFile(
      token,
      owner,
      repo,
      'chain-config/genesis-mainnet.json',
      mainEncoded,
      'Fix genesis file: remove cancunTime to fix blobSchedule error'
    );

    log('\n✅ Updated genesis-mainnet.json!', 'green');
    log(`📄 File URL: ${result2.content.html_url}`, 'cyan');

    // Update Dockerfile
    const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
    let dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    dockerfileContent = dockerfileContent.replace(
      /COPY chain-config\/genesis-mainnet\.json/g,
      'COPY chain-config/genesis-mainnet-fixed.json'
    );
    const dockerfileEncoded = Buffer.from(dockerfileContent).toString('base64');

    const result3 = await uploadFile(
      token,
      owner,
      repo,
      'Dockerfile',
      dockerfileEncoded,
      'Update Dockerfile to use fixed genesis file'
    );

    log('\n✅ Updated Dockerfile!', 'green');
    log(`📄 File URL: ${result3.content.html_url}`, 'cyan');

    log(`\n🔗 Repository: https://github.com/${owner}/${repo}`, 'cyan');
    log(`\n✨ All files updated! Now redeploy on Render!`, 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

