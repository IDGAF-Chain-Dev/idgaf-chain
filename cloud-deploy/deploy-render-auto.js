#!/usr/bin/env node

/**
 * Automated Render Deployment Script
 * Uses Render API to deploy IDGAF Chain node
 * 
 * Usage:
 *   node deploy-render-auto.js
 * 
 * Required:
 *   - RENDER_API_KEY (from https://dashboard.render.com/account/api-keys)
 *   - GitHub repository URL (optional, can use public repo)
 */

const https = require('https');
const readline = require('readline');

const RENDER_API_BASE = 'https://api.render.com/v1';

// Colors for console output
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
    planId: 'starter', // or 'free' for free tier
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

async function getServiceStatus(apiKey, serviceId) {
  try {
    const service = await makeRequest('GET', `/services/${serviceId}`, apiKey);
    return service;
  } catch (error) {
    log(`Error fetching service status: ${error.message}`, 'red');
    return null;
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  log('\n🚀 IDGAF Chain - Render Automated Deployment', 'cyan');
  log('==========================================\n', 'cyan');

  // Get API Key
  let apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    log('Render API Key is required.', 'yellow');
    log('Get it from: https://dashboard.render.com/account/api-keys', 'yellow');
    apiKey = await askQuestion('Enter your Render API Key: ');
    if (!apiKey) {
      log('API Key is required. Exiting.', 'red');
      process.exit(1);
    }
  }

  // Get GitHub repo URL
  log('\n📦 GitHub Repository', 'cyan');
  let repoUrl = await askQuestion('GitHub repository URL (or press Enter to skip): ');
  if (!repoUrl || repoUrl.trim() === '') {
    log('⚠️  No repository URL provided.', 'yellow');
    log('You can manually connect the repository in Render dashboard.', 'yellow');
    log('\nPlease create the service manually:', 'yellow');
    log('1. Go to https://dashboard.render.com', 'yellow');
    log('2. Click "New +" → "Web Service"', 'yellow');
    log('3. Connect your GitHub repository', 'yellow');
    log('4. Use these settings:', 'yellow');
    log('   - Dockerfile Path: cloud-deploy/Dockerfile.render', 'yellow');
    log('   - Environment Variables:', 'yellow');
    log('     NETWORK_ID=10144', 'yellow');
    log('     CHAIN_ID=10144', 'yellow');
    process.exit(0);
  }

  // Get owner
  log('\n🔍 Fetching your Render account...', 'cyan');
  const owners = await getOwners(apiKey);
  if (!owners || owners.length === 0) {
    log('No owners found. Please check your API key.', 'red');
    process.exit(1);
  }

  let ownerId = owners[0].id;
  if (owners.length > 1) {
    log('Multiple owners found:', 'yellow');
    owners.forEach((owner, idx) => {
      log(`  ${idx + 1}. ${owner.name} (${owner.type})`, 'yellow');
    });
    const choice = await askQuestion(`Select owner (1-${owners.length}): `);
    ownerId = owners[parseInt(choice) - 1].id;
  }

  // Create service
  try {
    log('\n🚀 Creating service...', 'cyan');
    const service = await createService(apiKey, ownerId, repoUrl);
    
    log('\n✅ Service created successfully!', 'green');
    log(`\nService ID: ${service.service.id}`, 'cyan');
    log(`Service Name: ${service.service.name}`, 'cyan');
    log(`\n🌐 Your service will be available at:`, 'green');
    log(`   https://${service.service.serviceDetails.url}`, 'green');
    log(`\n📊 Monitor deployment:`, 'cyan');
    log(`   https://dashboard.render.com/web/${service.service.id}`, 'cyan');
    
    log('\n⏳ Deployment is starting...', 'yellow');
    log('This may take 5-10 minutes.', 'yellow');
    log('Check the Render dashboard for progress.', 'yellow');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('\n💡 Alternative: Manual deployment', 'yellow');
    log('1. Go to https://dashboard.render.com', 'yellow');
    log('2. Click "New +" → "Web Service"', 'yellow');
    log('3. Connect your GitHub repository', 'yellow');
    log('4. Use Dockerfile: cloud-deploy/Dockerfile.render', 'yellow');
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

