"""
Pydantic models for statistical reports.
"""
from typing import List
from uuid import UUID

from pydantic import BaseModel


class ParkStatistic(BaseModel):
    """Model for statistics of a single park."""

    park_id: UUID
    park_name: str
    total_revenue: float
    tickets_sold: int


class VisitorStatistics(BaseModel):
    """Model for the overall visitor statistics report."""

    total_revenue: float
    total_tickets_sold: int
    revenue_by_park: List[ParkStatistic]
