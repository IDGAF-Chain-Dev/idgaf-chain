#!/usr/bin/env node

/**
 * Upload genesis-mainnet.json to GitHub
 * 
 * Usage:
 *   node upload-genesis.js <github-token>
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

  log('\n📤 Uploading genesis-mainnet.json to GitHub', 'cyan');
  log('==========================================\n', 'cyan');

  // Read genesis file
  const genesisPath = path.join(__dirname, '..', 'chain-config', 'genesis-mainnet.json');
  if (!fs.existsSync(genesisPath)) {
    log(`❌ File not found: ${genesisPath}`, 'red');
    log('\n💡 Creating a basic genesis file...', 'yellow');
    
    // Create basic genesis file
    const basicGenesis = {
      "config": {
        "chainId": 10144,
        "homesteadBlock": 0,
        "eip150Block": 0,
        "eip155Block": 0,
        "eip158Block": 0
      },
      "alloc": {},
      "coinbase": "0x0000000000000000000000000000000000000000",
      "difficulty": "0x400",
      "extraData": "",
      "gasLimit": "0x8000000",
      "nonce": "0x0000000000000042",
      "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "timestamp": "0x00"
    };
    
    // Ensure directory exists
    const dir = path.dirname(genesisPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(genesisPath, JSON.stringify(basicGenesis, null, 2));
    log(`✅ Created: ${genesisPath}`, 'green');
  }

  const content = fs.readFileSync(genesisPath, 'utf8');
  const encodedContent = Buffer.from(content).toString('base64');

  log(`Repository: ${owner}/${repo}`, 'cyan');
  log(`File: chain-config/genesis-mainnet.json`, 'cyan');
  log(`\n⏳ Uploading...`, 'yellow');

  try {
    const result = await uploadFile(
      token,
      owner,
      repo,
      'chain-config/genesis-mainnet.json',
      encodedContent,
      'Add genesis-mainnet.json for Render deployment'
    );

    log('\n✅ genesis-mainnet.json uploaded successfully!', 'green');
    log(`\n📄 File URL: ${result.content.html_url}`, 'cyan');
    log(`\n🔗 Repository: https://github.com/${owner}/${repo}`, 'cyan');
    log(`\n✨ Now you can redeploy on Render!`, 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    
    if (error.message.includes('401')) {
      log('\n💡 Invalid token. Please check your GitHub token.', 'yellow');
    } else if (error.message.includes('404')) {
      log('\n💡 Repository not found or no access.', 'yellow');
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

