#!/usr/bin/env node
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

// You need to replace this with your actual JWT token from browser cookies
const YOUR_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testFlagSubmission() {
  console.log('🧪 Testing Flag Submission\n');

  // Test data from the fixed machines
  const tests = [
    {
      name: 'Machine: hehe',
      machineId: '6971ac88b8c4b8acd3cc4622',
      vulnerabilityInstanceId: '6971ac88b8c4b8acd3cc4622-sql_injection-0-1769358384134-5abfb941b4d11af4',
      flag: 'FLAG{SQL_INJECTION_D5A4F96E15A16AD2C81FE33E}'
    },
    {
      name: 'Machine: hun',
      machineId: '6971b0e8b8c4b8acd3cc469c',
      vulnerabilityInstanceId: '6971b0e8b8c4b8acd3cc469c-sql_injection-0-1769358384187-3f11f806e2d97831',
      flag: 'FLAG{SQL_INJECTION_CCD8026FB3FE0EE716AED1EF}'
    }
  ];

  console.log('⚠️  IMPORTANT: You need to set YOUR_TOKEN variable with your actual JWT token from browser cookies!\n');
  console.log('How to get your token:');
  console.log('1. Open CyberForge in browser');
  console.log('2. Open DevTools (F12)');
  console.log('3. Go to Application > Cookies > http://localhost:3000');
  console.log('4. Copy the "token" value');
  console.log('5. Replace YOUR_JWT_TOKEN_HERE in this script\n');

  if (YOUR_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please set your JWT token first!\n');
    return;
  }

  for (const test of tests) {
    console.log(`\n🎯 Testing: ${test.name}`);
    console.log(`   Machine ID: ${test.machineId}`);
    console.log(`   Instance ID: ${test.vulnerabilityInstanceId}`);
    console.log(`   Flag: ${test.flag}`);

    try {
      const response = await fetch(`${API_URL}/api/flags/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${YOUR_TOKEN}`
        },
        body: JSON.stringify({
          machineId: test.machineId,
          vulnerabilityInstanceId: test.vulnerabilityInstanceId,
          flag: test.flag
        })
      });

      const data = await response.json();
      
      if (data.success && data.correct) {
        console.log(`   ✅ SUCCESS! ${data.message}`);
        console.log(`   Points Earned: ${data.points}`);
        console.log(`   Total Points: ${data.totalPoints}`);
      } else if (data.alreadySolved) {
        console.log(`   ⚠️  Already solved this vulnerability`);
      } else {
        console.log(`   ❌ FAILED: ${data.message || data.error}`);
        console.log(`   Response:`, data);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n\n💡 If you see authentication errors, make sure:');
  console.log('   1. Backend server is running (npm run server)');
  console.log('   2. You are logged in via browser');
  console.log('   3. Your JWT token is correct and not expired');
}

testFlagSubmission();
