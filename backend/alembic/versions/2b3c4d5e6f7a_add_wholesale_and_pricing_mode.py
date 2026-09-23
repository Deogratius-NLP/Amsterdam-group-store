"""Add wholesale and pricing mode fields with backfill

Revision ID: 2b3c4d5e6f7a
Revises: 174c5c37740a
Create Date: 2026-09-16 14:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b3c4d5e6f7a'
down_revision: Union[str, Sequence[str], None] = '174c5c37740a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update products table
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('retail_price', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'))
        batch_op.add_column(sa.Column('wholesale_price', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'))
        batch_op.add_column(sa.Column('wholesale_minimum_quantity', sa.Integer(), nullable=False, server_default='1'))

    # 2. Update orders table
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('pricing_mode', sa.String(length=20), nullable=False, server_default='RETAIL'))
        batch_op.create_index(batch_op.f('ix_orders_pricing_mode'), ['pricing_mode'], unique=False)

    # 3. Data Backfill:
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE products 
        SET retail_price = price,
            wholesale_price = ROUND(price * 0.85, 2),
            wholesale_minimum_quantity = 10
        WHERE retail_price = 0.00 OR retail_price IS NULL
    """))

    connection.execute(sa.text("""
        UPDATE orders
        SET pricing_mode = 'RETAIL'
        WHERE pricing_mode IS NULL
    """))


def downgrade() -> None:
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_orders_pricing_mode'))
        batch_op.drop_column('pricing_mode')

    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_column('wholesale_minimum_quantity')
        batch_op.drop_column('wholesale_price')
        batch_op.drop_column('retail_price')