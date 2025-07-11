#!/usr/bin/env tsx

import { systemUserTokenManager } from '../lib/auth/system-user-token-manager';
import { Buffer } from 'buffer';

interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

interface JWTPayload {
  iss?: string;
  aud?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  client_id?: string;
  scope?: string;
  [key: string]: any;
}

/**
 * Decode JWT without verification (for debugging purposes only)
 */
function decodeJWT(token: string): { header: JWTHeader; payload: JWTPayload } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

  return { header, payload };
}

/**
 * Format timestamp for human readability
 */
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Check if token is expired
 */
function isTokenExpired(exp: number): boolean {
  return Date.now() / 1000 > exp;
}

async function main() {
  console.log('🔍 JWT Token Debug Script');
  console.log('='.repeat(50));

  try {
    // Get token from SystemUserTokenManager
    console.log('📝 Getting token from SystemUserTokenManager...');
    const token = await systemUserTokenManager.getValidToken();
    console.log(`✅ Token obtained (length: ${token.length})`);

    // Decode JWT
    console.log('\n🔓 Decoding JWT...');
    const { header, payload } = decodeJWT(token);

    // Display header
    console.log('\n📋 JWT Header:');
    console.log(JSON.stringify(header, null, 2));

    // Display payload with analysis
    console.log('\n📋 JWT Payload:');
    console.log(JSON.stringify(payload, null, 2));

    // Key analysis
    console.log('\n🔍 Key Claims Analysis:');
    console.log('─'.repeat(30));

    if (payload.iss) {
      console.log(`🏢 Issuer (iss): ${payload.iss}`);
    } else {
      console.log('❌ No issuer (iss) claim found');
    }

    if (payload.aud) {
      console.log(
        `👥 Audience (aud): ${Array.isArray(payload.aud) ? payload.aud.join(', ') : payload.aud}`,
      );
    } else {
      console.log('❌ No audience (aud) claim found');
    }

    if (payload.sub) {
      console.log(`👤 Subject (sub): ${payload.sub}`);
    } else {
      console.log('❌ No subject (sub) claim found');
    }

    if (payload.client_id) {
      console.log(`🔑 Client ID: ${payload.client_id}`);
    } else {
      console.log('❌ No client_id claim found');
    }

    if (payload.scope) {
      console.log(`🎯 Scope: ${payload.scope}`);
    } else {
      console.log('❌ No scope claim found');
    }

    // Time analysis
    console.log('\n⏰ Time Claims Analysis:');
    console.log('─'.repeat(30));

    if (payload.iat) {
      console.log(`📅 Issued At (iat): ${formatTimestamp(payload.iat)} (${payload.iat})`);
    }

    if (payload.nbf) {
      console.log(`⏳ Not Before (nbf): ${formatTimestamp(payload.nbf)} (${payload.nbf})`);
    }

    if (payload.exp) {
      const expired = isTokenExpired(payload.exp);
      console.log(`⏱️  Expires At (exp): ${formatTimestamp(payload.exp)} (${payload.exp})`);
      console.log(`🔄 Token Status: ${expired ? '❌ EXPIRED' : '✅ VALID'}`);

      if (!expired) {
        const timeUntilExpiry = payload.exp - Date.now() / 1000;
        console.log(`⏳ Time until expiry: ${Math.round(timeUntilExpiry / 60)} minutes`);
      }
    }

    // Convex expectations
    console.log('\n🏗️  Convex Auth Configuration Analysis:');
    console.log('─'.repeat(40));
    console.log('Expected Convex auth.config.js:');
    console.log('  - domain: "https://api.workos.com/sso/oidc"');
    console.log('  - applicationID: process.env.WORKOS_CLIENT_ID');

    // Check compatibility
    console.log('\n🔍 Compatibility Check:');
    console.log('─'.repeat(25));

    // Check issuer compatibility
    if (payload.iss) {
      const expectedDomain = 'https://api.workos.com/sso/oidc';
      if (payload.iss.includes('workos.com')) {
        console.log('✅ Issuer contains workos.com domain');
        if (payload.iss === expectedDomain) {
          console.log('✅ Issuer exactly matches expected domain');
        } else {
          console.log(`⚠️  Issuer differs from expected domain:`);
          console.log(`   Expected: ${expectedDomain}`);
          console.log(`   Actual:   ${payload.iss}`);
        }
      } else {
        console.log('❌ Issuer does not contain workos.com domain');
      }
    }

    // Check audience/client_id compatibility
    const expectedClientId = process.env.WORKOS_CLIENT_ID;
    if (expectedClientId) {
      if (payload.aud === expectedClientId || payload.client_id === expectedClientId) {
        console.log('✅ Client ID matches expected value');
      } else {
        console.log('❌ Client ID mismatch:');
        console.log(`   Expected: ${expectedClientId}`);
        console.log(`   Token aud: ${payload.aud || 'not present'}`);
        console.log(`   Token client_id: ${payload.client_id || 'not present'}`);
      }
    } else {
      console.log('❌ WORKOS_CLIENT_ID not found in environment');
    }

    // Additional debugging info
    console.log('\n🔧 Additional Debug Info:');
    console.log('─'.repeat(30));
    console.log(`📍 Current time: ${new Date().toISOString()}`);
    console.log(`🏷️  Token ID (jti): ${payload.jti || 'not present'}`);

    // List all other claims
    const standardClaims = ['iss', 'aud', 'sub', 'exp', 'iat', 'nbf', 'jti', 'client_id', 'scope'];
    const otherClaims = Object.keys(payload).filter((key) => !standardClaims.includes(key));

    if (otherClaims.length > 0) {
      console.log('\n📋 Other Claims:');
      console.log('─'.repeat(20));
      otherClaims.forEach((claim) => {
        console.log(`   ${claim}: ${JSON.stringify(payload[claim])}`);
      });
    }

    // Raw token (first 50 chars for verification)
    console.log('\n🔒 Token Preview (first 50 chars):');
    console.log(token.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  void main();
}
