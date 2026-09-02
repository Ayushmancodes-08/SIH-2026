"""
SIPER NLP & Information Extraction Engine
Extracts entities, identifiers (Phone, Vehicle, Account, Location, Name), and temporal links from police documents.
"""
import re
from typing import Dict, Any, List, Tuple

# Regex patterns for Indian investigative domains
PATTERNS = {
    "phone": r"(?:\+91[\-\s]?)?[6-9]\d{9}",
    "vehicle_plate": r"\b[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{4}\b",
    "ifsc_code": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    "account_number": r"\b\d{9,18}\b",
    "fir_number": r"\bFIR[-\s]?(?:No\.?)?[-\s]?\d{1,6}/\d{2,4}\b",
    "amount": r"(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{2})?",
    "date": r"\b\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b"
}

# Known Indian Locations in SIH PS 26189 Scenario
KNOWN_LOCATIONS = [
    "Cuttack", "Bhubaneswar", "Rourkela", "Sambalpur", "Balasore", "Puri",
    "Kolkata", "Howrah", "Mumbai", "Delhi", "Gurugram", "Noida", "Cyber Hub",
    "Warehouse 4", "Industrial Area Sector 5", "Port Area", "Grand Trunk Road"
]

# Known Organizations in SIH PS 26189 Scenario
KNOWN_ORGS = [
    "Garuda Logistics Pvt Ltd", "Apex Shell Holdings", "Kalinga Trading Syndicate",
    "East Coast Shipping Co", "Orissa Financial Services", "Shadow FinTech Corp"
]

def extract_structured_entities(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """Parse raw investigative text and extract entities with character offsets and confidence."""
    extracted = {
        "persons": [],
        "phones": [],
        "vehicles": [],
        "locations": [],
        "organizations": [],
        "financial_accounts": [],
        "firs": [],
        "amounts": [],
        "dates": []
    }

    if not text:
        return extracted

    # 1. Phone Numbers
    for match in re.finditer(PATTERNS["phone"], text):
        num = match.group(0).replace("-", "").replace(" ", "")
        extracted["phones"].append({
            "value": num,
            "span": [match.start(), match.end()],
            "confidence": 0.98,
            "type": "Phone"
        })

    # 2. Vehicle Registration Plates
    for match in re.finditer(PATTERNS["vehicle_plate"], text):
        plate = match.group(0).upper().replace(" ", "-")
        extracted["vehicles"].append({
            "value": plate,
            "span": [match.start(), match.end()],
            "confidence": 0.95,
            "type": "Vehicle"
        })

    # 3. Bank IFSC / Accounts
    for match in re.finditer(PATTERNS["ifsc_code"], text):
        extracted["financial_accounts"].append({
            "value": match.group(0).upper(),
            "span": [match.start(), match.end()],
            "confidence": 0.95,
            "type": "FinancialAccount",
            "subtype": "IFSC"
        })

    # 4. Known Locations
    for loc in KNOWN_LOCATIONS:
        pattern = rf"\b{re.escape(loc)}\b"
        for match in re.finditer(pattern, text, re.IGNORECASE):
            extracted["locations"].append({
                "value": loc,
                "span": [match.start(), match.end()],
                "confidence": 0.92,
                "type": "Location"
            })

    # 5. Known Organizations
    for org in KNOWN_ORGS:
        pattern = rf"\b{re.escape(org)}\b"
        for match in re.finditer(pattern, text, re.IGNORECASE):
            extracted["organizations"].append({
                "value": org,
                "span": [match.start(), match.end()],
                "confidence": 0.94,
                "type": "Organization"
            })

    # 6. FIR Numbers
    for match in re.finditer(PATTERNS["fir_number"], text, re.IGNORECASE):
        extracted["firs"].append({
            "value": match.group(0),
            "span": [match.start(), match.end()],
            "confidence": 0.99,
            "type": "Incident"
        })

    # 7. Amounts
    for match in re.finditer(PATTERNS["amount"], text):
        extracted["amounts"].append({
            "value": match.group(0),
            "span": [match.start(), match.end()],
            "confidence": 0.90
        })

    # 8. Dates
    for match in re.finditer(PATTERNS["date"], text):
        extracted["dates"].append({
            "value": match.group(0),
            "span": [match.start(), match.end()],
            "confidence": 0.88
        })

    # 9. Extract named persons via heuristics (e.g. "accused [Name]", "suspect [Name]", "Mr. [Name]")
    person_patterns = [
        r"(?:accused|suspect|investigated|alias|named|co-conspirator)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})",
        r"(?:Shri|Mr\.|Late)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})"
    ]
    for p in person_patterns:
        for match in re.finditer(p, text):
            p_name = match.group(1).strip()
            if p_name not in [p["value"] for p in extracted["persons"]]:
                extracted["persons"].append({
                    "value": p_name,
                    "span": [match.start(1), match.end(1)],
                    "confidence": 0.86,
                    "type": "Person"
                })

    return extracted
