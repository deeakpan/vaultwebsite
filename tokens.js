#!/usr/bin/env node
// JavaScript version - No TypeScript syntax
const fs = require('fs');
const https = require('https');
const path = require('path');

const FILENAME = 'pepe-unchained-tokens.json';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Invalid JSON: ${data.substring(0, 200)}...`));
        }
      });
    }).on('error', reject);
  });
}

function loadExistingTokens() {
  if (!fs.existsSync(FILENAME)) {
    console.log('📄 No existing JSON file found, will create new one');
    return new Map();
  }
  
  console.log('📖 Reading existing tokens from JSON file...');
  const content = fs.readFileSync(FILENAME, 'utf8');
  const existingTokens = new Map();
  
  try {
    const jsonData = JSON.parse(content);
    
    if (jsonData.tokens) {
      for (const [key, address] of Object.entries(jsonData.tokens)) {
        if (address.startsWith('0x')) {
          const addressKey = address.toLowerCase();
          if (!existingTokens.has(addressKey)) {
            const name = key.charAt(0).toUpperCase() + key.slice(1);
            existingTokens.set(addressKey, {
              address,
              symbol: key.toUpperCase(),
              name: name,
              decimals: 18
            });
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Error parsing existing JSON:', error.message);
    return new Map();
  }
  
  console.log(`✅ Found ${existingTokens.size} existing tokens`);
  return existingTokens;
}

async function testNetwork() {
  console.log('🔍 Testing pepe-unchained network...');
  
  const poolUrl = 'https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/0x4be3af53800aade09201654cd76d55063c7bde70';
  
  try {
    const poolData = await makeRequest(poolUrl);
    if (poolData.data) {
      console.log('✅ Network accessible');
      return await getAllPools();
    }
  } catch (error) {
    console.log('❌ Network test failed:', error.message);
  }
  
  return [];
}

async function getAllPools() {
  console.log('🚀 Scanning for new tokens...');
  
  const existingTokens = loadExistingTokens();
  const allTokens = new Map(existingTokens);
  const newTokens = [];
  let page = 1;
  
  try {
    while (page <= 10) {
      console.log(`📄 Scanning page ${page}...`);
      
      const poolsUrl = `https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools?page=${page}&limit=100`;
      const poolsData = await makeRequest(poolsUrl);
      
      const pools = poolsData.data || [];
      if (pools.length === 0) break;
      
      console.log(`📊 Checking ${pools.length} pools for new tokens...`);
      
      for (const pool of pools) {
        try {
          const poolId = pool.id.split('_')[1];
          const detailUrl = `https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/${poolId}?include=base_token,quote_token`;
          const detail = await makeRequest(detailUrl);
          
          if (detail.included) {
            detail.included.forEach(item => {
              if (item.type === 'token') {
                const attrs = item.attributes;
                const tokenKey = attrs.address.toLowerCase();
                
                if (!allTokens.has(tokenKey)) {
                  const newToken = {
                    address: attrs.address,
                    symbol: attrs.symbol || 'UNKNOWN',
                    name: attrs.name || 'Unknown Token',
                    decimals: attrs.decimals || 18
                  };
                  
                  allTokens.set(tokenKey, newToken);
                  newTokens.push(newToken);
                  console.log(`🆕 NEW TOKEN: ${newToken.name} (${newToken.symbol}) - ${newToken.address}`);
                }
              }
            });
          }
          
          if (!detail.included || detail.included.length === 0) {
            const relationships = detail.data && detail.data.relationships;
            if (relationships) {
              
              if (relationships.base_token && relationships.base_token.data && relationships.base_token.data.id) {
                const tokenId = relationships.base_token.data.id;
                const tokenAddress = tokenId.split('_')[1];
                if (tokenAddress && !allTokens.has(tokenAddress.toLowerCase())) {
                  const newToken = await getTokenDetails(tokenAddress);
                  if (newToken) {
                    allTokens.set(tokenAddress.toLowerCase(), newToken);
                    newTokens.push(newToken);
                    console.log(`🆕 NEW TOKEN: ${newToken.name} (${newToken.symbol}) - ${newToken.address}`);
                  }
                }
              }
              
              if (relationships.quote_token && relationships.quote_token.data && relationships.quote_token.data.id) {
                const tokenId = relationships.quote_token.data.id;
                const tokenAddress = tokenId.split('_')[1];
                if (tokenAddress && !allTokens.has(tokenAddress.toLowerCase())) {
                  const newToken = await getTokenDetails(tokenAddress);
                  if (newToken) {
                    allTokens.set(tokenAddress.toLowerCase(), newToken);
                    newTokens.push(newToken);
                    console.log(`🆕 NEW TOKEN: ${newToken.name} (${newToken.symbol}) - ${newToken.address}`);
                  }
                }
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          continue;
        }
      }
      
      page++;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  const totalTokens = Array.from(allTokens.values());
  console.log(`\n📊 SCAN COMPLETE:`);
  console.log(`   Total tokens: ${totalTokens.length}`);
  console.log(`   Existing tokens: ${existingTokens.size}`);
  console.log(`   New tokens found: ${newTokens.length}`);
  
  return { allTokens: totalTokens, newTokens, existingCount: existingTokens.size };
}

async function getTokenDetails(tokenAddress) {
  try {
    const tokenUrl = `https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${tokenAddress}`;
    const tokenData = await makeRequest(tokenUrl);
    
    if (tokenData.data && tokenData.data.attributes) {
      const attrs = tokenData.data.attributes;
      return {
        address: attrs.address,
        symbol: attrs.symbol || 'UNKNOWN',
        name: attrs.name || 'Unknown Token',
        decimals: attrs.decimals || 18
      };
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}

function generateJSON(allTokens, newTokensCount, existingCount) {
  const date = new Date().toISOString();
  
  const tokens = {};
  
  allTokens.sort((a, b) => a.name.localeCompare(b.name));
  
  allTokens.forEach(token => {
    const symbolKey = token.symbol.toLowerCase();
    const nameKey = token.name.toLowerCase();
    
    tokens[symbolKey] = token.address;
    
    if (nameKey !== symbolKey) {
      tokens[nameKey] = token.address;
    }
    
    if (token.symbol.startsWith('$')) {
      const withoutDollar = token.symbol.substring(1).toLowerCase();
      tokens[withoutDollar] = token.address;
    } else {
      const withDollar = '$' + token.symbol.toLowerCase();
      tokens[withDollar] = token.address;
    }
  });
  
  const jsonStructure = {
    lastUpdated: date,
    network: "pepe-unchained",
    totalTokens: allTokens.length,
    previousCount: existingCount,
    newTokensAdded: newTokensCount,
    tokens: tokens,
    tokenDetails: allTokens.reduce((acc, token) => {
      acc[token.address.toLowerCase()] = {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        address: token.address
      };
      return acc;
    }, {})
  };
  
  return JSON.stringify(jsonStructure, null, 2);
}

async function main() {
  console.log('🔥 Pepe Unchained Token Updater - JavaScript Version');
  console.log('==================================================\n');
  
  const result = await testNetwork();
  
  if (!result || result.allTokens.length === 0) {
    console.log('❌ No tokens found');
    return;
  }
  
  const { allTokens, newTokens, existingCount } = result;
  
  if (newTokens.length === 0) {
    console.log('✅ No new tokens found - database is up to date!');
    console.log(`📊 Current total: ${allTokens.length} tokens`);
    return;
  }
  
  console.log(`\n🆕 NEW TOKENS DISCOVERED:`);
  newTokens.forEach((token, index) => {
    console.log(`${index + 1}. ${token.name} (${token.symbol}) - ${token.address}`);
  });
  
  const jsonContent = generateJSON(allTokens, newTokens.length, existingCount);
  fs.writeFileSync(FILENAME, jsonContent);
  
  console.log(`\n✅ Updated: ${FILENAME}`);
  console.log(`📊 Total tokens: ${allTokens.length} (+${newTokens.length} new)`);
  console.log(`📁 File saved to: ${path.resolve(FILENAME)}`);
}

main().catch(console.error);