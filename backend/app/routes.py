from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import get_db
from .models import Claim, ClaimVote, User

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


class VoteIn(BaseModel):
    user_id: int = Field(..., ge=1)
    claim_id: int = Field(..., ge=1)
    vote_value: int = Field(..., ge=-2, le=2)
    claim_quality: bool


class DistributionOut(BaseModel):
    vote_distribution: dict[int, int]
    claim_quality_distribution: dict[int, int]


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.get("/claims", response_model=list[ClaimOut])
def list_claims(db: Session = Depends(get_db)):
    return db.query(Claim).order_by(Claim.id).all()


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

    # Claim quality distribution (claim_quality_votes, current only)
    from .models import ClaimQualityVote

    quality_rows = (
        db.query(ClaimQualityVote.quality, func.count(1))
        .filter(ClaimQualityVote.claim_id == claim_id, ClaimQualityVote.is_current == True)
        .group_by(ClaimQualityVote.quality)
        .all()
    )
    claim_quality_distribution = {-2: 0, -1: 0, 0: 0, 1: 0, 2: 0}
    for val, count in quality_rows:
        claim_quality_distribution[val] = count

    return DistributionOut(
        vote_distribution=vote_distribution,
        claim_quality_distribution=claim_quality_distribution,
    )


@router.post("/votes")
def cast_vote(vote: VoteIn, db: Session = Depends(get_db)):
    # Validate user and claim exist
    user = db.query(User).filter(User.id == vote.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    claim = db.query(Claim).filter(Claim.id == vote.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    now = datetime.now(timezone.utc)

    # SCD2: close existing current vote for this user+claim
    existing = (
        db.query(ClaimVote)
        .filter(
            ClaimVote.user_id == vote.user_id,
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
        user_id=vote.user_id,
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
