"""add trash fields to files

Revision ID: a8913635bed3
Revises: 7987bf1d1461
Create Date: ...
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8913635bed3'
down_revision: Union[str, Sequence[str], None] = '7987bf1d1461'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'files',
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        )
    )

    op.create_index(
        op.f('ix_files_is_deleted'),
        'files',
        ['is_deleted'],
        unique=False
    )

def downgrade() -> None:
    op.drop_index(
        op.f('ix_files_is_deleted'),
        table_name='files'
    )

    op.drop_column(
        'files',
        'is_deleted'
    )