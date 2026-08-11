from dataclasses import dataclass, field

from bots.bot_loader import ROUTER_BOT_ID, Message


@dataclass
class Session:
    user_id: str
    history: list[Message] = field(default_factory=list)
    current_bot: str = ROUTER_BOT_ID


active_sessions: dict[str, Session] = {}


def get_or_create_session(user_id: str) -> Session:
    if user_id not in active_sessions:
        active_sessions[user_id] = Session(user_id=user_id)
    return active_sessions[user_id]


def history_to_llm_format(history: list[Message]) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in history]


def clear_history(user_id: str) -> None:
    if user_id in active_sessions:
        del active_sessions[user_id]
