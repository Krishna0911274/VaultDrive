"""create files table

Revision ID: dcf6f7882e56
Revises: a6f878e42777
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "dcf6f7882e56"
down_revision: Union[str, Sequence[str], None] = "a6f878e42777"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "files",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False
        ),

        sa.Column(
            "owner_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "folder_id",
            sa.Integer(),
            nullable=True
        ),

        sa.Column(
            "stored_object_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=False
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"]
        ),

        sa.ForeignKeyConstraint(
            ["folder_id"],
            ["folders.id"]
        ),

        sa.ForeignKeyConstraint(
            ["stored_object_id"],
            ["stored_objects.id"]
        ),

        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        op.f("ix_files_id"),
        "files",
        ["id"],
        unique=False
    )


def downgrade() -> None:

    op.drop_index(
        op.f("ix_files_id"),
        table_name="files"
    )

    op.drop_table("files")