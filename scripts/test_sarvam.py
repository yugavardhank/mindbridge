"""
Quick test — run this to verify your Sarvam AI key works.

Usage:
  cd backend
  .\venv\Scripts\activate
  python ..\scripts\test_sarvam.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from ai_engine.sarvam_client import chat_with_maitri
from services.crisis_handler import check_for_crisis

print("\n🧪 MindBridge — Phase 1 Test Suite")
print("=" * 45)

# Test 1: Sarvam AI connection
print("\n[1] Testing Sarvam AI connection...")
try:
    response = chat_with_maitri([
        {"role": "user", "content": "I've been feeling really anxious about my exams lately."}
    ])
    print(f"✅ Connected! Response preview:")
    print(f"   {response[:120]}...")
except Exception as e:
    print(f"❌ Failed: {e}")
    print("   → Check your SARVAM_API_KEY in backend/.env")

# Test 2: Hindi support
print("\n[2] Testing Hindi language support...")
try:
    response = chat_with_maitri([
        {"role": "user", "content": "Mujhe bahut stress ho raha hai aajkal."}
    ], language="hi-IN")
    print(f"✅ Hindi works! Response preview:")
    print(f"   {response[:120]}...")
except Exception as e:
    print(f"❌ Failed: {e}")

# Test 3: Crisis detection
print("\n[3] Testing crisis detection...")
test_cases = [
    ("I want to die", True),
    ("I've been feeling sad", False),
    ("marna chahta hoon", True),
    ("Today was a tough day at work", False),
]

all_passed = True
for text, expected_crisis in test_cases:
    result = check_for_crisis(text)
    passed = result.is_crisis == expected_crisis
    status = "✅" if passed else "❌"
    if not passed: all_passed = False
    print(f"   {status} '{text[:40]}' → crisis={result.is_crisis} (expected {expected_crisis})")

if all_passed:
    print("✅ All crisis detection tests passed!")

print("\n" + "=" * 45)
print("Phase 1 tests complete. If all green, you're ready!")
print("Run: uvicorn app:app --reload --port 8000")
print()