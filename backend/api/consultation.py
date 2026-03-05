"""
Consultation API routes
POST /api/consultation/start          — start a new session
POST /api/consultation/message        — send a message, get AI response
GET  /api/consultation/history        — get past sessions
GET  /api/consultation/{session_id}   — get full transcript of a session
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db.models import get_db, Session as DBSession, Message, RiskLog, User
from ai_engine.sarvam_client import chat_with_maitri
from services.crisis_handler import check_for_crisis
from api.auth import get_current_user

router = APIRouter(prefix="/api/consultation", tags=["consultation"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class StartSessionResponse(BaseModel):
    session_id: str
    message: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en-IN"


class ChatResponse(BaseModel):
    response: str
    is_crisis: bool
    helplines: list[str]
    session_id: str


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartSessionResponse)
def start_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_token = str(uuid.uuid4())
    session = DBSession(
        user_id=current_user.id,
        session_token=session_token,
        channel="web",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return StartSessionResponse(
        session_id=session_token,
        message="Session started. I'm here with you."
    )


@router.post("/message", response_model=ChatResponse)
def send_message(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find session
    session = db.query(DBSession).filter(
        DBSession.session_token == req.session_id,
        DBSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # ── Crisis check FIRST, before anything else ──────────────────────────
    crisis = check_for_crisis(req.message)

    if crisis.is_crisis:
        # Log the risk event (immutable)
        risk_log = RiskLog(
            session_id=session.id,
            user_id=current_user.id,
            trigger_phrase=crisis.trigger_phrase or req.message[:200],
            system_response=crisis.response,
            helpline_shown=True,
        )
        db.add(risk_log)
        session.is_crisis_flagged = True

        # Save user message
        user_msg = Message(
            session_id=session.id,
            role="user",
            content=req.message,
            is_crisis_flagged=True,
            language=req.language,
        )
        db.add(user_msg)

        # Save crisis response
        ai_msg = Message(
            session_id=session.id,
            role="assistant",
            content=crisis.response,
            is_crisis_flagged=True,
            language=req.language,
        )
        db.add(ai_msg)
        db.commit()

        return ChatResponse(
            response=crisis.response,
            is_crisis=True,
            helplines=crisis.helplines,
            session_id=req.session_id,
        )

    # ── Normal flow: load conversation history ────────────────────────────
    past_messages = db.query(Message).filter(
        Message.session_id == session.id
    ).order_by(Message.created_at).all()

    # Build message history for LLM (last 10 turns to manage context)
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in past_messages[-10:]
    ]
    conversation_history.append({"role": "user", "content": req.message})

    # ── Call Sarvam AI ────────────────────────────────────────────────────
    ai_response = chat_with_maitri(
        messages=conversation_history,
        language=req.language,
    )

    # ── Save both messages to DB ──────────────────────────────────────────
    user_msg = Message(
        session_id=session.id,
        role="user",
        content=req.message,
        language=req.language,
    )
    ai_msg = Message(
        session_id=session.id,
        role="assistant",
        content=ai_response,
        language=req.language,
    )
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()

    return ChatResponse(
        response=ai_response,
        is_crisis=False,
        helplines=[],
        session_id=req.session_id,
    )


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(DBSession).filter(
        DBSession.user_id == current_user.id
    ).order_by(DBSession.started_at.desc()).limit(20).all()

    return [
        {
            "session_id": s.session_token,
            "started_at": s.started_at,
            "ended_at": s.ended_at,
            "is_crisis_flagged": s.is_crisis_flagged,
            "channel": s.channel,
        }
        for s in sessions
    ]


@router.get("/{session_id}")
def get_session_transcript(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).filter(
        DBSession.session_token == session_id,
        DBSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(Message).filter(
        Message.session_id == session.id
    ).order_by(Message.created_at).all()

    return {
        "session_id": session_id,
        "started_at": session.started_at,
        "is_crisis_flagged": session.is_crisis_flagged,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at,
                "language": m.language,
            }
            for m in messages
        ]
    }