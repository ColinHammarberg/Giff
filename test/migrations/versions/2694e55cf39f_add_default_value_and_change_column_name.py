"""add default value and change column name

Revision ID: 2694e55cf39f
Revises: 82c0017326bb
Create Date: 2023-11-07 15:58:15.175076

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2694e55cf39f'
down_revision = '82c0017326bb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('selected_resolution', sa.String(length=120), nullable=True))
        batch_op.drop_column('user_selected_resolution')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_selected_resolution', sa.VARCHAR(length=120), autoincrement=False, nullable=True))
        batch_op.drop_column('selected_resolution')

    # ### end Alembic commands ###
