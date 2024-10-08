"""add resolution

Revision ID: b681d0b61746
Revises: 48e2b010b628
Create Date: 2023-11-06 23:34:34.869287

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b681d0b61746'
down_revision = '48e2b010b628'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('selected_resolution', sa.String(length=120), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('selected_resolution')

    # ### end Alembic commands ###
