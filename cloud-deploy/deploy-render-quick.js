#!/usr/bin/env node

/**
 * Quick Render Deployment - Non-interactive version
 * Usage: node deploy-render-quick.js <api-key> <github-repo-url>
 */

const https = require('https');

const RENDER_API_BASE = 'https://api.render.com/v1';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, apiKey, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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

async function getOwners(apiKey) {
  try {
    const owners = await makeRequest('GET', '/owners', apiKey);
    return owners;
  } catch (error) {
    log(`Error fetching owners: ${error.message}`, 'red');
    return null;
  }
}

async function createService(apiKey, ownerId, repoUrl) {
  const serviceData = {
    type: 'web_service',
    name: 'idgaf-chain-node',
    ownerId: ownerId,
    repo: repoUrl,
    branch: 'main',
    rootDir: '.',
    envVars: [
      { key: 'NETWORK_ID', value: '10144' },
      { key: 'CHAIN_ID', value: '10144' },
    ],
    dockerfilePath: 'cloud-deploy/Dockerfile.render',
    dockerContext: '.',
    planId: 'starter', // free tier
    region: 'oregon',
    healthCheckPath: '/',
    autoDeploy: true,
  };

  try {
    log('Creating service on Render...', 'cyan');
    const service = await makeRequest('POST', '/services', apiKey, serviceData);
    return service;
  } catch (error) {
    log(`Error creating service: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  const apiKey = process.argv[2];
  const repoUrl = process.argv[3];

  if (!apiKey) {
    log('Usage: node deploy-render-quick.js <api-key> <github-repo-url>', 'red');
    log('Example: node deploy-render-quick.js rnd_xxx https://github.com/user/repo', 'yellow');
    process.exit(1);
  }

  if (!repoUrl) {
    log('GitHub repository URL is required.', 'red');
    log('Example: https://github.com/username/idgaf-chain', 'yellow');
    process.exit(1);
  }

  log('\n🚀 IDGAF Chain - Render Automated Deployment', 'cyan');
  log('==========================================\n', 'cyan');

  // Get owner
  log('🔍 Fetching your Render account...', 'cyan');
  const owners = await getOwners(apiKey);
  if (!owners || owners.length === 0) {
    log('No owners found. Please check your API key.', 'red');
    process.exit(1);
  }

  const ownerId = owners[0].id;
  log(`✅ Using account: ${owners[0].name}`, 'green');

  // Create service
  try {
    log(`\n🚀 Creating service with repository: ${repoUrl}`, 'cyan');
    const service = await createService(apiKey, ownerId, repoUrl);
    
    log('\n✅ Service created successfully!', 'green');
    log(`\nService ID: ${service.service.id}`, 'cyan');
    log(`Service Name: ${service.service.name}`, 'cyan');
    
    if (service.service.serviceDetails && service.service.serviceDetails.url) {
      log(`\n🌐 Your RPC endpoint will be:`, 'green');
      log(`   https://${service.service.serviceDetails.url}`, 'green');
    }
    
    log(`\n📊 Monitor deployment:`, 'cyan');
    log(`   https://dashboard.render.com/web/${service.service.id}`, 'cyan');
    
    log('\n⏳ Deployment is starting...', 'yellow');
    log('This may take 5-10 minutes.', 'yellow');
    log('Check the Render dashboard for progress.', 'yellow');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    
    if (error.message.includes('401')) {
      log('\n💡 API Key is invalid. Please check:', 'yellow');
      log('   1. Go to https://dashboard.render.com/account/api-keys', 'yellow');
      log('   2. Create a new API key', 'yellow');
      log('   3. Make sure you copied the full key', 'yellow');
    } else if (error.message.includes('repo')) {
      log('\n💡 Repository issue. Please check:', 'yellow');
      log('   1. Repository URL is correct', 'yellow');
      log('   2. Repository is public or connected to Render', 'yellow');
      log('   3. Repository has the required files', 'yellow');
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

