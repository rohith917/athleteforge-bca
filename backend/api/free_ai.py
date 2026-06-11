"""
Optional free LLM layer (Groq / Gemini) on top of Forge rule-based AI.
Falls back to answer_copilot_question when no API key or provider errors.
"""
import json
import os
import urllib.error
import urllib.request

from .ai_insights import answer_copilot_question

GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = 'llama-3.1-8b-instant'
GEMINI_MODEL = 'gemini-2.0-flash'
GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

SYSTEM_PROMPT = (
    'You are Forge AI, the performance strategist inside AthleteForge. '
    'Answer the coach or athlete in clear, actionable language (2–5 short paragraphs max). '
    'Use ONLY the athlete data in the context block — never invent stats. '
    'If data is missing, say what is needed. Prefer bullet points for plans and tips.'
)


def get_ai_provider_status():
    """Which AI backend is active: groq, gemini, or rules-only Forge AI."""
    if os.environ.get('GROQ_API_KEY', '').strip():
        return {
            'available': True,
            'provider': 'groq',
            'label': 'Groq Free AI',
            'mode': 'llm',
        }
    if os.environ.get('GEMINI_API_KEY', '').strip():
        return {
            'available': True,
            'provider': 'gemini',
            'label': 'Gemini Free AI',
            'mode': 'llm',
        }
    return {
        'available': True,
        'provider': 'rules',
        'label': 'Forge AI',
        'mode': 'rules',
    }


def _compact_insights(insights):
    """Trim insights bundle for LLM context without losing key fields."""
    keys = (
        'athlete_name', 'athlete_sport', 'athlete_team', 'demo_mode',
        'readiness_score', 'readiness_analysis', 'coaching_brief',
        'performance_insights', 'injury_risk', 'attendance_analysis',
        'training_plan', 'competition_intel', 'weight_analysis',
        'progress_summary', 'action_items', 'sport_tips',
    )
    return {k: insights[k] for k in keys if k in insights}


def build_context_prompt(insights):
    """Serialize athlete intelligence for the LLM user message."""
    compact = _compact_insights(insights or {})
    name = compact.get('athlete_name', 'Athlete')
    try:
        blob = json.dumps(compact, default=str, ensure_ascii=False)
    except (TypeError, ValueError):
        blob = str(compact)
    if len(blob) > 12000:
        blob = blob[:12000] + '…'
    return (
        f'Athlete context for {name}:\n'
        f'{blob}\n\n'
        'Answer using this data. Reference specific numbers when relevant.'
    )


def _http_post_json(url, payload, headers, timeout=28):
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _call_groq(question, insights):
    api_key = os.environ['GROQ_API_KEY'].strip()
    payload = {
        'model': GROQ_MODEL,
        'temperature': 0.35,
        'max_tokens': 900,
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {
                'role': 'user',
                'content': f'{build_context_prompt(insights)}\n\nQuestion: {question}',
            },
        ],
    }
    data = _http_post_json(
        GROQ_CHAT_URL,
        payload,
        {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
    )
    choices = data.get('choices') or []
    if not choices:
        raise ValueError('Groq returned no choices')
    content = (choices[0].get('message') or {}).get('content', '').strip()
    if not content:
        raise ValueError('Groq returned empty content')
    return content


def _call_gemini(question, insights):
    api_key = os.environ['GEMINI_API_KEY'].strip()
    url = f'{GEMINI_BASE}/{GEMINI_MODEL}:generateContent?key={api_key}'
    payload = {
        'systemInstruction': {'parts': [{'text': SYSTEM_PROMPT}]},
        'contents': [
            {
                'role': 'user',
                'parts': [
                    {
                        'text': (
                            f'{build_context_prompt(insights)}\n\n'
                            f'Question: {question}'
                        ),
                    },
                ],
            },
        ],
        'generationConfig': {
            'temperature': 0.35,
            'maxOutputTokens': 900,
        },
    }
    data = _http_post_json(url, payload, {'Content-Type': 'application/json'})
    candidates = data.get('candidates') or []
    if not candidates:
        raise ValueError('Gemini returned no candidates')
    parts = (candidates[0].get('content') or {}).get('parts') or []
    text = ''.join(p.get('text', '') for p in parts).strip()
    if not text:
        raise ValueError('Gemini returned empty content')
    return text


def generate_free_ai_answer(question, insights):
    """
    Try free LLM (Groq → Gemini), else Forge rules engine.
    Returns dict: answer, ai_provider, ai_mode, llm_used (bool).
    """
    status = get_ai_provider_status()
    provider = status['provider']
    rules_answer = answer_copilot_question(insights, question)

    if provider == 'rules':
        return {
            'answer': rules_answer,
            'ai_provider': provider,
            'ai_mode': 'rules',
            'llm_used': False,
        }

    try:
        if provider == 'groq':
            answer = _call_groq(question, insights)
        else:
            answer = _call_gemini(question, insights)
        return {
            'answer': answer,
            'ai_provider': provider,
            'ai_mode': 'llm',
            'llm_used': True,
        }
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, KeyError):
        return {
            'answer': rules_answer,
            'ai_provider': provider,
            'ai_mode': 'rules_fallback',
            'llm_used': False,
        }