from pathlib import Path
import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BotConfig:
    skill_id: str
    name: str
    description: str
    skill_path: Optional[Path] = None
    system_prompt: str = ""
    model: str = ""
    fallback_model: str = ""


@dataclass
class Message:
    role: str
    content: str
    bot_id: str = ""


BOT_REGISTRY: dict[str, BotConfig] = {}
_PROJECT_ROOT = Path(__file__).parent.parent
LOCAL_SKILL_DIR = _PROJECT_ROOT / "skills"
GLOBAL_SKILL_DIR = Path.home() / ".config" / "opencode" / "skills"

BOT_MODEL_CONFIG: dict[str, tuple[str, str]] = {
    "general-nana-kwame_bot": ("anthropic/claude-3.5-haiku", "anthropic/claude-3-haiku"),
    "tourism-maame-yaa_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
    "culture-osei-tutu_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
    "language-obaa-sarpongmaa_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
}


def _find_skill_file(skill_id: str) -> Path:
    local = LOCAL_SKILL_DIR / skill_id / "SKILL.md"
    if local.exists():
        return local
    global_f = GLOBAL_SKILL_DIR / skill_id / "SKILL.md"
    if global_f.exists():
        return global_f
    raise FileNotFoundError(
        f"Skill not found: checked {local} and {global_f}"
    )


def _load_skill(skill_id: str) -> str:
    skill_file = _find_skill_file(skill_id)
    return skill_file.read_text(encoding="utf-8")


def register_bot(skill_id: str) -> BotConfig:
    if skill_id in BOT_REGISTRY:
        return BOT_REGISTRY[skill_id]

    skill_content = _load_skill(skill_id)
    skill_file = _find_skill_file(skill_id)

    frontmatter_match = re.match(r"^---\n(.*?)\n---\n", skill_content, re.DOTALL)
    if not frontmatter_match:
        raise ValueError(f"Invalid SKILL.md format for {skill_id}: missing frontmatter")

    meta: dict[str, str] = {}
    for line in frontmatter_match.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()

    skill_body = skill_content[frontmatter_match.end() :].strip()
    model, fallback = BOT_MODEL_CONFIG.get(skill_id, ("", ""))

    config = BotConfig(
        skill_id=skill_id,
        name=meta.get("name", skill_id),
        description=meta.get("description", ""),
        skill_path=skill_file,
        system_prompt=skill_body,
        model=model,
        fallback_model=fallback,
    )
    BOT_REGISTRY[skill_id] = config
    return config


def get_bot(skill_id: str) -> BotConfig:
    if skill_id not in BOT_REGISTRY:
        return register_bot(skill_id)
    return BOT_REGISTRY[skill_id]


def get_all_bots() -> list[BotConfig]:
    return list(BOT_REGISTRY.values())


ROUTER_BOT_ID = "general-nana-kwame_bot"
SPECIALIST_BOT_IDS = {
    "culture": "culture-osei-tutu_bot",
    "language": "language-obaa-sarpongmaa_bot",
    "tourism": "tourism-maame-yaa_bot",
}

ALL_ROUTES = {"general": ROUTER_BOT_ID, **SPECIALIST_BOT_IDS}

SKILL_ID_TO_ROUTE: dict[str, str] = {v: k for k, v in ALL_ROUTES.items()}

def get_route_for_skill(skill_id: str) -> str:
    return SKILL_ID_TO_ROUTE.get(skill_id, "general")

BOT_DISPLAY_NAMES: dict[str, str] = {
    "general-nana-kwame_bot": "Nana Kwame",
    "tourism-maame-yaa_bot": "Maame Yaa",
    "culture-osei-tutu_bot": "Osei Tutu",
    "language-obaa-sarpongmaa_bot": "Obaa Sarpongmaa",
}

# for _bot_id in [ROUTER_BOT_ID] + list(SPECIALIST_BOT_IDS.values()):
#     register_bot(_bot_id)