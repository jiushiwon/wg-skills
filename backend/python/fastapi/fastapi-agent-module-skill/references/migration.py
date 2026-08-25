# Alembic 迁移文件

"""init agent module

Revision ID: agent_001
Revises:
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

revision = 'agent_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 会话表
    op.create_table('{prefix}_agent_session',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False, description='关联用户ID'),
        sa.Column('title', sa.String(length=200), nullable=False, description='会话标题'),
        sa.Column('model', sa.String(length=50), nullable=True, default='gpt-4o-mini'),
        sa.Column('status', sa.Integer(), nullable=True, default=1),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 消息表
    op.create_table('{prefix}_agent_message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False, description='会话ID'),
        sa.Column('role', sa.String(length=20), nullable=False, description='角色 user/assistant/system/tool'),
        sa.Column('content', sa.Text(), nullable=False, description='消息内容'),
        sa.Column('tool_name', sa.String(length=50), nullable=True),
        sa.Column('tool_result', sa.Text(), nullable=True),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['session_id'], ['{prefix}_agent_session.id'])
    )


def downgrade():
    op.drop_table('{prefix}_agent_message')
    op.drop_table('{prefix}_agent_session')
