"""create folders table

Revision ID: 82fc0d94f9a3
Revises: 23c604358f21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "82fc0d94f9a3"

down_revision: Union[str, Sequence[str], None] = "23c604358f21"

branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "folders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),

        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"]
        ),

        sa.ForeignKeyConstraint(
            ["parent_id"],
            ["folders.id"]
        ),

        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        op.f("ix_folders_id"),
        "folders",
        ["id"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_folders_id"),
        table_name="folders"
    )

    op.drop_table("folders")