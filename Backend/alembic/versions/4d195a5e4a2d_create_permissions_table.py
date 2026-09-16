"""create permissions table

Revision ID: 4d195a5e4a2d
Revises: dcf6f7882e56
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4d195a5e4a2d"
down_revision: Union[str, Sequence[str], None] = "dcf6f7882e56"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "permissions",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "folder_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"]
        ),

        sa.ForeignKeyConstraint(
            ["folder_id"],
            ["folders.id"]
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint(
            "user_id",
            "folder_id",
            name="unique_user_folder_permission"
        )
    )

    op.create_index(
        op.f("ix_permissions_id"),
        "permissions",
        ["id"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_permissions_id"),
        table_name="permissions"
    )

    op.drop_table("permissions")