"""
FlowPilot AI — Internal NLP Classification Engine
Uses HuggingFace zero-shot classification (facebook/bart-large-mnli) running 
entirely on-device without any external API dependency.

Model: facebook/bart-large-mnli
Task:  Zero-shot text classification + regex-based entity extraction
"""

import re
import json
import threading
from typing import Dict, Any, Tuple

# ─── Lazy-loaded model (downloaded once, cached by HuggingFace) ─────────────
_classifier = None
_model_lock = threading.Lock()
_model_ready = False
_model_loading = False

MODEL_ID = "facebook/bart-large-mnli"

# Intent labels the model chooses from
INTENT_LABELS = [
    "Sales Inquiry",
    "Support Request",
    "Customer Success",
    "General Question"
]

def _load_model():
    """Load the HuggingFace zero-shot classifier into memory (thread-safe)."""
    global _classifier, _model_ready, _model_loading
    with _model_lock:
        if _model_ready:
            return
        _model_loading = True
        try:
            from transformers import pipeline
            print(f"[FlowPilot NLP] Loading model '{MODEL_ID}' — this may take a moment on first run...")
            _classifier = pipeline(
                "zero-shot-classification",
                model=MODEL_ID,
                device=-1  # CPU only — no CUDA required
            )
            _model_ready = True
            print("[FlowPilot NLP] Model loaded and ready.")
        except Exception as e:
            print(f"[FlowPilot NLP] Model load failed: {e}. Falling back to local regex parser.")
            _model_ready = False
        finally:
            _model_loading = False


def _get_classifier():
    """Return the classifier, loading it if not yet ready."""
    if not _model_ready:
        _load_model()
    return _classifier if _model_ready else None


# ─── Entity Extraction (Regex-based, runs on both paths) ────────────────────

def _extract_entities(message: str) -> Dict[str, Any]:
    """
    Extract structured business entities from free-text using regex patterns.
    Returns: { service, budget, priority, score }
    """
    lower = message.lower()
    service = None
    budget = 0.0
    priority = "Medium"
    score = 50

    # --- Budget extraction ---
    budget_match = re.search(
        r'(?:budget|worth|approx|price|cost|around|spend|invest)\s*[\$£€]?\s*(\d+[\d,]*\b[kK]?)',
        lower
    )
    if budget_match:
        val = budget_match.group(1).replace(",", "").lower()
        budget = float(val.replace("k", "")) * 1000 if val.endswith("k") else float(val)
    else:
        # Fallback: grab first standalone 3-6 digit number as likely budget
        nums = re.findall(r'\b\d{3,6}\b', lower)
        if nums:
            budget = float(nums[0])

    # --- Service detection ---
    if any(k in lower for k in ["ecommerce", "e-commerce", "online store", "shopify"]):
        service = "Ecommerce Website"
    elif any(k in lower for k in ["website", "web app", "web application", "landing page"]):
        service = "Web Application"
    elif any(k in lower for k in ["mobile app", "ios", "android", "flutter", "react native"]):
        service = "Mobile Application"
    elif any(k in lower for k in ["crm", "salesforce", "hubspot", "zoho", "database"]):
        service = "CRM Integration"
    elif any(k in lower for k in ["marketing", "seo", "campaign", "ads", "social media"]):
        service = "Marketing Operations"
    elif any(k in lower for k in ["support", "help desk", "ticket", "sla", "helpdesk"]):
        service = "Support SLA Automation"
    elif any(k in lower for k in ["api", "integration", "webhook", "backend"]):
        service = "API & Integration Services"
    elif any(k in lower for k in ["cloud", "aws", "azure", "gcp", "devops", "kubernetes"]):
        service = "Cloud & DevOps"
    elif any(k in lower for k in ["security", "penetration", "cybersecurity", "compliance", "audit"]):
        service = "Cybersecurity & Compliance"

    # --- Priority & Score from budget ---
    if budget > 50000:
        priority = "High"
        score = 97
    elif budget > 30000:
        priority = "High"
        score = 92
    elif budget > 10000:
        priority = "Medium"
        score = 75
    elif budget > 0:
        priority = "Low"
        score = 45

    # Urgency override for support requests
    if any(k in lower for k in ["urgent", "production", "critical", "down", "outage", "immediately"]):
        priority = "High"
        score = max(score, 88)

    return {
        "service": service,
        "budget": budget,
        "priority": priority,
        "score": score
    }


# ─── Local Regex Fallback Classifier ────────────────────────────────────────

def local_analyze_message(message: str) -> Tuple[str, str, Dict[str, Any]]:
    """
    Pure regex-based intent classifier used when the HuggingFace model is
    unavailable or still loading.
    """
    lower = message.lower()
    extracted = _extract_entities(message)
    service = extracted["service"]
    budget = extracted["budget"]

    intent = "General Question"
    reply = "Thank you for reaching out! I've logged your message and our team will follow up shortly."

    if service and budget > 0:
        intent = "Sales Inquiry"
        reply = (
            f"Excellent opportunity detected! I've logged a high-priority Sales Inquiry "
            f"for '{service}' with a budget of ${budget:,.2f}. "
            f"One of our specialists will reach out to you shortly."
        )
    elif any(k in lower for k in ["crash", "broken", "issue", "fail", "error", "bug", "down", "outage", "not working"]):
        intent = "Support Request"
        reply = (
            f"I've detected an operational issue. Your request has been classified as a "
            f"Support Request with '{extracted['priority']}' priority. "
            f"A dedicated ticket has been automatically created for you."
        )
    elif any(k in lower for k in ["onboard", "health", "customer success", "retention", "account"]):
        intent = "Customer Success"
        reply = (
            "Acknowledged! I've updated your account logs to notify your dedicated "
            "Customer Success Manager."
        )

    return intent, reply, extracted


# ─── Primary HuggingFace NLP Classifier ─────────────────────────────────────

async def analyze_message_with_ai(message: str, api_key: str = None) -> Tuple[str, str, Dict[str, Any]]:
    """
    Main entry point for FlowPilot's internal NLP engine.

    Uses HuggingFace bart-large-mnli zero-shot classification for intent detection
    and regex-based extraction for entity parsing.
    Falls back to pure regex parsing if the model is unavailable.

    The `api_key` parameter is retained for backward compatibility but is
    no longer required — FlowPilot now runs fully on-device.
    """
    classifier = _get_classifier()

    if classifier is None:
        print("[FlowPilot NLP] Using local regex fallback.")
        return local_analyze_message(message)

    try:
        # Run zero-shot classification
        result = classifier(
            message,
            candidate_labels=INTENT_LABELS,
            multi_label=False
        )

        # Pick the highest-confidence label
        intent = result["labels"][0]
        confidence = result["scores"][0]

        # Extract structured entities via regex
        extracted = _extract_entities(message)

        # Build a professional reply based on classified intent
        service = extracted.get("service")
        budget = extracted.get("budget", 0)
        priority = extracted.get("priority", "Medium")
        score = extracted.get("score", 50)

        if intent == "Sales Inquiry":
            if service and budget > 0:
                reply = (
                    f"Excellent! I've classified this as a Sales Inquiry "
                    f"for '{service}' with a budget of ${budget:,.2f}. "
                    f"Our AI has assigned a {score}% deal match score. "
                    f"A sales specialist will contact you shortly!"
                )
            else:
                reply = (
                    f"I've classified this as a Sales Inquiry (confidence: {confidence:.0%}). "
                    f"Could you share more details about your budget and requirements? "
                    f"Our team will reach out to discuss the best solution."
                )
        elif intent == "Support Request":
            reply = (
                f"I've detected a support issue and classified this as a Support Request "
                f"with '{priority}' priority (confidence: {confidence:.0%}). "
                f"A dedicated ticket has been automatically created and assigned to our technical team."
            )
        elif intent == "Customer Success":
            reply = (
                f"I've logged your customer success request (confidence: {confidence:.0%}). "
                f"Your dedicated Customer Success Manager has been notified and will follow up shortly."
            )
        else:
            reply = (
                f"Thank you for your message! I've logged it as a General Inquiry "
                f"(confidence: {confidence:.0%}). Our team will review and respond soon."
            )

        return intent, reply, extracted

    except Exception as e:
        print(f"[FlowPilot NLP] Classification error: {e}. Using local regex fallback.")
        return local_analyze_message(message)


# ─── Eagerly warm up the model in a background thread on import ─────────────
def _warmup():
    """Pre-load the model in the background so the first request is instant."""
    warmup_thread = threading.Thread(target=_load_model, daemon=True)
    warmup_thread.start()

_warmup()
