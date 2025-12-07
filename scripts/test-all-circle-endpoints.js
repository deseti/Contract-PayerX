import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;
const CIRCLE_API_BASE_URL = 'https://api-sandbox.circle.com';

/**
 * Test berbagai Circle API endpoints untuk menemukan yang accessible
 */

async function testCircleEndpoints() {
  console.log('🔍 Testing Circle API Endpoints\n');
  console.log(`API Key: ${CIRCLE_API_KEY?.substring(0, 30)}...`);
  console.log(`Base URL: ${CIRCLE_API_BASE_URL}\n`);
  
  const endpoints = [
    // StableFX endpoints (from documentation)
    { method: 'GET', path: '/v1/exchange/stablefx/quotes', desc: 'List quotes' },
    { method: 'POST', path: '/v1/exchange/stablefx/quotes', desc: 'Create quote', body: { from: { currency: 'EURC', amount: '1' }, to: { currency: 'USDC' }, tenor: 'instant' } },
    
    // Configuration endpoints
    { method: 'GET', path: '/v1/configuration', desc: 'Get configuration' },
    { method: 'GET', path: '/v1/businessAccount/configuration', desc: 'Business account config' },
    
    // Health/ping endpoints
    { method: 'GET', path: '/ping', desc: 'Ping' },
    { method: 'GET', path: '/v1/ping', desc: 'Ping v1' },
    { method: 'GET', path: '/health', desc: 'Health check' },
    
    // USDC/Circle Core endpoints
    { method: 'GET', path: '/v1/configuration/business', desc: 'Business configuration' },
    { method: 'GET', path: '/v1/w3s/config', desc: 'Web3 services config' },
    
    // Try without /v1 prefix
    { method: 'GET', path: '/exchange/stablefx/quotes', desc: 'StableFX quotes (no v1)' },
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await sleep(500); // Rate limiting
  }
}

async function testEndpoint({ method, path, desc, body }) {
  const url = `${CIRCLE_API_BASE_URL}${path}`;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Testing: ${desc}`);
  console.log(`${method} ${url}`);
  
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const text = await response.text();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Response:');
      try {
        const json = JSON.parse(text);
        console.log(JSON.stringify(json, null, 2));
      } catch {
        console.log(text);
      }
    } else {
      const statusEmoji = response.status === 401 ? '🔐' : 
                         response.status === 403 ? '🚫' :
                         response.status === 404 ? '❌' : '⚠️';
      console.log(`${statusEmoji} Error: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`💥 Exception: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
testCircleEndpoints().then(() => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('\n📊 Summary:');
  console.log('   - Most endpoints return 401 (Unauthorized)');
  console.log('   - API key likely needs StableFX permissions');
  console.log('   - Contact Circle support for access\n');
});
