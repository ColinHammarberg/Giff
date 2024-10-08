"""duration

Revision ID: a314beff0272
Revises: 084bb14102cb
Create Date: 2024-01-04 09:53:10.351353

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a314beff0272'
down_revision = '084bb14102cb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_gif', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_gif', schema=None) as batch_op:
        batch_op.drop_column('duration')

    # ### end Alembic commands ###
