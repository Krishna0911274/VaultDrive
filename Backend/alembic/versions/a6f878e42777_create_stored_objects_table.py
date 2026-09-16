"""create stored objects table

Revision ID: a6f878e42777
Revises: 82fc0d94f9a3
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a6f878e42777"
down_revision: Union[str, Sequence[str], None] = "82fc0d94f9a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stored_objects",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "file_hash",
            sa.String(length=64),
            nullable=False
        ),

        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=False
        ),

        sa.Column(
            "storage_path",
            sa.String(length=500),
            nullable=False
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint("file_hash")
    )

    op.create_index(
        op.f("ix_stored_objects_id"),
        "stored_objects",
        ["id"],
        unique=False
    )

    op.create_index(
        op.f("ix_stored_objects_file_hash"),
        "stored_objects",
        ["file_hash"],
        unique=True
    )


def downgrade() -> None:
    pass