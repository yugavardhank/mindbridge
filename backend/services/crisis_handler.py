"""
Crisis Safety System
Layer 1: Keyword matching (fast, always-on)
Layer 2: Semantic pattern matching

If triggered → returns crisis response + helpline info.
All triggers are logged to risk_logs table (immutable).
"""

import re
from dataclasses import dataclass

# ─── Crisis Keywords (English + Hindi + Hinglish) ───────────────────────────
CRISIS_KEYWORDS = [
    # English
    "want to die", "kill myself", "end my life", "suicide", "suicidal",
    "can't go on", "cannot go on", "don't want to live", "do not want to live",
    "end it all", "no reason to live", "better off dead", "hurt myself",
    "self harm", "self-harm", "cut myself", "overdose",
    "no point living", "worthless", "want to disappear forever",

    # Hindi (romanized)
    "marna chahta", "marna chahti", "jeena nahi", "zindagi khatam",
    "khud ko hurt", "khatam kar lun", "khatam kar loon",
    "maut chahiye", "mar jaana", "mar jana chahta",

    # Hindi (devanagari)
    "मरना चाहता", "मरना चाहती", "जीना नहीं", "ज़िंदगी ख़त्म",
    "खुद को नुकसान", "ख़त्म कर लूं", "मौत चाहिए",
]

# ─── Pattern-based detection ─────────────────────────────────────────────────
CRISIS_PATTERNS = [
    r"(want|wish|hope).{0,20}(die|dead|death|disappear)",
    r"(thinking|thought).{0,20}(suicide|killing myself|ending it)",
    r"(no|don.t|dont).{0,20}(reason|point|purpose).{0,20}(live|living|life)",
    r"(better|world).{0,20}(without me)",
    r"(can.t|cannot|won.t).{0,20}(take it|handle|go on|continue)",
]

# ─── Crisis Response Template ────────────────────────────────────────────────
CRISIS_RESPONSE = """I hear you, and I'm really glad you shared this with me. 
What you're feeling right now is real — and you don't have to face it alone.

Please reach out to a counselor right now:
📞 iCall: 9152987821 (Mon–Sat, 8am–10pm)
📞 Vandrevala Foundation: 1860-2662-345 (24/7, free)
📞 NIMHANS: 080-46110007

You matter. This moment is not the end of your story. 
Is there someone close to you — a friend, family member — you could call right now?"""


@dataclass
class CrisisCheckResult:
    is_crisis: bool
    trigger_phrase: str | None
    response: str | None
    helplines: list[str]


def check_for_crisis(text: str) -> CrisisCheckResult:
    """
    Check if a message contains crisis signals.
    Returns CrisisCheckResult with is_crisis flag and appropriate response.
    """
    text_lower = text.lower().strip()

    # Layer 1: Keyword matching
    for keyword in CRISIS_KEYWORDS:
        if keyword.lower() in text_lower:
            return CrisisCheckResult(
                is_crisis=True,
                trigger_phrase=keyword,
                response=CRISIS_RESPONSE,
                helplines=[
                    "iCall: 9152987821",
                    "Vandrevala Foundation: 1860-2662-345",
                    "NIMHANS: 080-46110007"
                ]
            )

    # Layer 2: Pattern matching
    for pattern in CRISIS_PATTERNS:
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            return CrisisCheckResult(
                is_crisis=True,
                trigger_phrase=match.group(0),
                response=CRISIS_RESPONSE,
                helplines=[
                    "iCall: 9152987821",
                    "Vandrevala Foundation: 1860-2662-345",
                    "NIMHANS: 080-46110007"
                ]
            )

    return CrisisCheckResult(
        is_crisis=False,
        trigger_phrase=None,
        response=None,
        helplines=[]
    )


if __name__ == "__main__":
    # Quick test
    test_messages = [
        "I want to die",
        "I've been feeling a bit sad lately",
        "marna chahta hoon",
        "I don't see any reason to live anymore",
        "Today was a rough day at work",
    ]

    for msg in test_messages:
        result = check_for_crisis(msg)
        status = "🚨 CRISIS" if result.is_crisis else "✅ SAFE"
        print(f"{status} | '{msg[:50]}'")
        if result.is_crisis:
            print(f"   Trigger: '{result.trigger_phrase}'")