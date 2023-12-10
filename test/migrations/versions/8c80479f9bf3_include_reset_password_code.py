"""include reset password code

Revision ID: 8c80479f9bf3
Revises: 9c1cf48792ab
Create Date: 2023-12-10 21:47:30.737672

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8c80479f9bf3'
down_revision = '9c1cf48792ab'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reset_password_code', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('reset_password_status', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('reset_password_status')
        batch_op.drop_column('reset_password_code')

    # ### end Alembic commands ###
