# Alembic 迁移文件
# ✅ 修复 P0-P3: 添加关键索引（session_id/user_id/deleted_at/updated_at）
# 注意：表前缀需要在生成时从配置中获取并替换 {db_prefix}

"""init agent module

Revision ID: agent_001
Revises:
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

# 表前缀占位符，生成时需要替换为实际值（从 app/config.py 的 settings.db_prefix 获取）
# 例如：如果 settings.db_prefix = "wg"，则表名为 wg_agent_session
TABLE_PREFIX = "{db_prefix}"

revision = 'agent_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 会话表
    op.create_table(f'{TABLE_PREFIX}_agent_session',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='关联用户ID'),
        sa.Column('title', sa.String(length=200), nullable=False, comment='会话标题'),
        sa.Column('model', sa.String(length=50), nullable=True, server_default='gpt-4o-mini'),
        sa.Column('status', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 消息表
    op.create_table(f'{TABLE_PREFIX}_agent_message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False, comment='会话ID'),
        sa.Column('role', sa.String(length=20), nullable=False, comment='角色 user/assistant/system/tool'),
        sa.Column('content', sa.Text(), nullable=False, comment='消息内容'),
        sa.Column('tool_name', sa.String(length=50), nullable=True),
        sa.Column('tool_result', sa.Text(), nullable=True),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        # ✅ 修复 P2-1: 级联删除（硬删除会话时自动清理消息）
        sa.ForeignKeyConstraint(
            ['session_id'],
            [f'{TABLE_PREFIX}_agent_session.id'],
            ondelete='CASCADE'
        )
    )

    # ✅ 修复 P0-P3: 关键索引（高频查询路径全覆盖）
    # AgentSession 索引
    op.create_index(
        f'ix_{TABLE_PREFIX}_agent_session_user_updated',
        f'{TABLE_PREFIX}_agent_session',
        ['user_id', 'updated_at'],
        unique=False
    )
    op.create_index(
        f'ix_{TABLE_PREFIX}_agent_session_user_deleted',
        f'{TABLE_PREFIX}_agent_session',
        ['user_id', 'deleted_at'],
        unique=False
    )
    op.create_index(
        f'ix_{TABLE_PREFIX}_agent_session_user_id',
        f'{TABLE_PREFIX}_agent_session',
        ['user_id', 'id'],
        unique=False
    )

    # AgentMessage 索引
    op.create_index(
        f'ix_{TABLE_PREFIX}_agent_message_session_created',
        f'{TABLE_PREFIX}_agent_message',
        ['session_id', 'created_at'],
        unique=False
    )
    op.create_index(
        f'ix_{TABLE_PREFIX}_agent_message_session_role',
        f'{TABLE_PREFIX}_agent_message',
        ['session_id', 'role'],
        unique=False
    )


def downgrade():
    # 索引删除顺序：先删索引，再删表
    op.drop_index(f'ix_{TABLE_PREFIX}_agent_message_session_role', f'{TABLE_PREFIX}_agent_message')
    op.drop_index(f'ix_{TABLE_PREFIX}_agent_message_session_created', f'{TABLE_PREFIX}_agent_message')
    op.drop_index(f'ix_{TABLE_PREFIX}_agent_session_user_id', f'{TABLE_PREFIX}_agent_session')
    op.drop_index(f'ix_{TABLE_PREFIX}_agent_session_user_deleted', f'{TABLE_PREFIX}_agent_session')
    op.drop_index(f'ix_{TABLE_PREFIX}_agent_session_user_updated', f'{TABLE_PREFIX}_agent_session')

    op.drop_table(f'{TABLE_PREFIX}_agent_message')
    op.drop_table(f'{TABLE_PREFIX}_agent_session')