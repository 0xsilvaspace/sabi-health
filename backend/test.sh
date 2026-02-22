#!/bin/bash

# Configuration
API_URL="http://localhost:8000"
USER_PHONE=8012345678
USER_PWD="password123"
LGA="Kano"

echo "🚀 Starting Sabi Health API Tests..."

# 1. Root Test
echo -e "\n1. Testing Root Endpoint..."
curl -s -X GET "$API_URL/" | grep -q "Sabi Health API is running" && echo "✅ Success" || echo "❌ Failed"

# 2. Register User
echo -e "\n2. Testing User Registration..."
REG_RESPONSE=$(curl -s -X POST "$API_URL/register" \
     -H "Content-Type: application/json" \
     -d "{
           \"name\": \"Test User\",
           \"phone\": $USER_PHONE,
           \"lga\": \"$LGA\",
           \"password\": \"$USER_PWD\"
         }")
USER_ID=$(echo $REG_RESPONSE | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

if [ ! -z "$USER_ID" ]; then
    echo "✅ Success (User ID: $USER_ID)"
else
    echo "❌ Failed: $REG_RESPONSE"
fi

# 3. Login User
echo -e "\n3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
     -H "Content-Type: application/json" \
     -d "{
           \"phone\": $USER_PHONE,
           \"password\": \"$USER_PWD\"
         }")
if echo $LOGIN_RESPONSE | grep -q "\"phone\":$USER_PHONE"; then
    echo "✅ Success"
else
    echo "❌ Failed: $LOGIN_RESPONSE"
fi

# 4. Get Profile
echo -e "\n4. Testing Get Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/profile/$USER_ID")
if echo $PROFILE_RESPONSE | grep -q "$USER_ID"; then
    echo "✅ Success"
else
    echo "❌ Failed: $PROFILE_RESPONSE"
fi

# 5. List Users
echo -e "\n5. Testing List Users..."
USERS_RESPONSE=$(curl -s -X GET "$API_URL/users")
if echo $USERS_RESPONSE | grep -q "$USER_ID"; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

# 6. Risk Check
echo -e "\n6. Testing Risk Check..."
RISK_RESPONSE=$(curl -s -X GET "$API_URL/risk-check/$USER_ID")
if echo $RISK_RESPONSE | grep -q "risk"; then
    echo "✅ Success"
else
    echo "❌ Failed: $RISK_RESPONSE"
fi

# 7. Log Symptoms
echo -e "\n7. Testing Log Symptoms..."
SYMPTOM_RESPONSE=$(curl -s -X POST "$API_URL/symptoms" \
     -H "Content-Type: application/json" \
     -d "{
           \"user_id\": \"$USER_ID\",
           \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
           \"fever\": 1,
           \"cough\": 0,
           \"headache\": 1,
           \"fatigue\": 0,
           \"notes\": \"Testing symptom log\"
         }")
if echo $SYMPTOM_RESPONSE | grep -q "fever\":1"; then
    echo "✅ Success"
else
    echo "❌ Failed: $SYMPTOM_RESPONSE"
fi

# 8. Me Endpoint
echo -e "\n8. Testing Me Endpoint..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/me/$USER_ID")
if echo $ME_RESPONSE | grep -q "health_score"; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

# 9. Test Risk (LGA specific)
echo -e "\n9. Testing LGA Risk Endpoint..."
LGA_RISK=$(curl -s -X GET "$API_URL/test-risk?lga=$LGA")
if echo $LGA_RISK | grep -q "risk"; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

echo -e "\n🏁 API Tests Completed!"