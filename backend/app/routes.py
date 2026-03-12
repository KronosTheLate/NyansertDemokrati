from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import get_db
from .models import Claim, ClaimVote, User
from .auth import verify_google_token, create_access_token, get_current_user

router = APIRouter()


# Schemas
class UserOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ClaimOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class GoogleAuthIn(BaseModel):
    credential: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class VoteIn(BaseModel):
    claim_id: int = Field(..., ge=1)
    vote_value: int = Field(..., ge=-2, le=2)
    claim_quality: int = Field(..., ge=-1, le=1)


class DistributionOut(BaseModel):
    vote_distribution: dict[int, int]
    claim_quality_distribution: dict[int, int]


class UserVoteOut(BaseModel):
    claim_id: int
    vote_value: int
    claim_quality: int


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.get("/claims", response_model=list[ClaimOut])
def list_claims(db: Session = Depends(get_db)):
    return db.query(Claim).order_by(Claim.id).all()


@router.get("/users/{user_id}/votes", response_model=list[UserVoteOut])
def get_user_votes(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    votes = (
        db.query(ClaimVote.claim_id, ClaimVote.vote_value, ClaimVote.claim_quality)
        .filter(
            ClaimVote.user_id == user_id,
            ClaimVote.is_current == True,
        )
        .all()
    )
    return [{"claim_id": cid, "vote_value": vv, "claim_quality": cq} for cid, vv, cq in votes]


@router.get("/claims/{claim_id}/distribution", response_model=DistributionOut)
def get_claim_distribution(claim_id: int, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Vote distribution (claim_votes, current only)
    vote_rows = (
        db.query(ClaimVote.vote_value, func.count(ClaimVote.id))
        .filter(ClaimVote.claim_id == claim_id, ClaimVote.is_current == True)
        .group_by(ClaimVote.vote_value)
        .all()
    )
    vote_distribution = {-2: 0, -1: 0, 0: 0, 1: 0, 2: 0}
    for val, count in vote_rows:
        vote_distribution[val] = count

    quality_rows = (
        db.query(ClaimVote.claim_quality, func.count(ClaimVote.id))
        .filter(ClaimVote.claim_id == claim_id, ClaimVote.is_current == True)
        .group_by(ClaimVote.claim_quality)
        .all()
    )
    claim_quality_distribution = {-1: 0, 0: 0, 1: 0}
    for val, count in quality_rows:
        claim_quality_distribution[val] = count

    return DistributionOut(
        vote_distribution=vote_distribution,
        claim_quality_distribution=claim_quality_distribution,
    )


@router.post("/auth/google", response_model=TokenOut)
def auth_google(auth_in: GoogleAuthIn, db: Session = Depends(get_db)):
    # Verify the token with Google
    idinfo = verify_google_token(auth_in.credential)
    
    google_id = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name", "Unknown User")
    
    if not google_id:
        raise HTTPException(status_code=400, detail="Invalid Google token (no sub)")
        
    # Find or create user
    user = db.query(User).filter(User.google_id == google_id).first()
    
    if not user:
        # Check by email just in case we have existing users we want to merge, but simple approach is just create
        user = User(name=name, google_id=google_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Mint our own JWT
    access_token = create_access_token(user_id=user.id)
    
    return TokenOut(access_token=access_token, user=user)


@router.post("/votes")
def cast_vote(vote: VoteIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validate claim exist
    claim = db.query(Claim).filter(Claim.id == vote.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    now = datetime.now(timezone.utc)

    # SCD2: close existing current vote for this user+claim
    existing = (
        db.query(ClaimVote)
        .filter(
            ClaimVote.user_id == current_user.id,
            ClaimVote.claim_id == vote.claim_id,
            ClaimVote.is_current == True,
        )
        .first()
    )
    if existing:
        existing.valid_to = now
        existing.is_current = False

    # Insert new current vote
    new_vote = ClaimVote(
        user_id=current_user.id,
        claim_id=vote.claim_id,
        vote_value=vote.vote_value,
        claim_quality=vote.claim_quality,
        valid_from=now,
        valid_to=None,
        is_current=True,
    )
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    return {"id": new_vote.id, "message": "Vote recorded"}
