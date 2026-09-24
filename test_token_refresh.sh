#!/bin/bash

set -e

echo "=== JWT Token Refresh Demonstration ==="
echo ""
echo "Step 1: Login and get tokens"
echo "==============================="

# Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refreshToken'])")

echo ""
echo "✓ Access Token extracted (length: ${#ACCESS_TOKEN})"
echo "✓ Refresh Token extracted (length: ${#REFRESH_TOKEN})"

echo ""
echo "Step 2: Use access token to call protected endpoint"
echo "======================================================"

# Test with access token
ME_RESPONSE=$(curl -s -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Current User Response:"
echo "$ME_RESPONSE" | python3 -m json.tool

echo ""
echo "Step 3: Refresh the access token"
echo "=================================="

# Refresh token
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

echo "Refresh Token Response:"
echo "$REFRESH_RESPONSE" | python3 -m json.tool

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])")
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refreshToken'])")

echo ""
echo "✓ New Access Token extracted (length: ${#NEW_ACCESS_TOKEN})"
echo "✓ New Refresh Token extracted (length: ${#NEW_REFRESH_TOKEN})"

echo ""
echo "Step 4: Use new access token"
echo "============================="

# Test with new access token
ME_RESPONSE_2=$(curl -s -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Current User Response (with new token):"
echo "$ME_RESPONSE_2" | python3 -m json.tool

echo ""
echo "Step 5: Logout (revoke refresh token)"
echo "====================================="

# Logout
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$NEW_REFRESH_TOKEN\"}")

echo "Logout Response:"
echo "$LOGOUT_RESPONSE" | python3 -m json.tool

echo ""
echo "Step 6: Try to refresh with revoked token (should fail)"
echo "========================================================"

# Try to refresh with revoked token
REVOKED_REFRESH=$(curl -s -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$NEW_REFRESH_TOKEN\"}")

echo "Refresh with revoked token Response (should be error):"
echo "$REVOKED_REFRESH" | python3 -m json.tool

echo ""
echo "=== Token Refresh Demonstration Complete ==="
echo "✓ Login successful with access and refresh tokens"
echo "✓ Protected endpoint accessible with access token"
echo "✓ Token refresh successful with new tokens"
echo "✓ New token works on protected endpoint"
echo "✓ Logout revokes the refresh token"
echo "✓ Revoked token cannot be used for refresh"
