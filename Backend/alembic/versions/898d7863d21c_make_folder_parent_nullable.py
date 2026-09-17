"""make folder parent nullable

Revision ID: 898d7863d21c
Revises: adb2d41c2632
Create Date: 2026-09-17 08:30:06.782171

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '898d7863d21c'
down_revision: Union[str, Sequence[str], None] = 'adb2d41c2632'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "folders",
        "parent_id",
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "folders",
        "parent_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
