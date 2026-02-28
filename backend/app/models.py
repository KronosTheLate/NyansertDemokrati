from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, PrimaryKeyConstraint, SmallInteger, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)

    claim_votes = relationship("ClaimVote", back_populates="user")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)

    claim_votes = relationship("ClaimVote", back_populates="claim")


class ClaimVote(Base):
    __tablename__ = "claim_votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    vote_value = Column(SmallInteger, nullable=False)  # -2 to 2
    claim_quality = Column(Boolean, nullable=False)
    valid_from = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    valid_to = Column(DateTime(timezone=True), nullable=True)
    is_current = Column(Boolean, nullable=False, default=True)

    user = relationship("User", back_populates="claim_votes")
    claim = relationship("Claim", back_populates="claim_votes")


class ClaimQualityVote(Base):
    __tablename__ = "claim_quality_votes"
    __table_args__ = (PrimaryKeyConstraint("claim_id", "valid_from"),)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    quality = Column(SmallInteger, nullable=False)  # -2 to 2
    valid_from = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    valid_to = Column(DateTime(timezone=True), nullable=True)
    is_current = Column(Boolean, nullable=False, default=True)
