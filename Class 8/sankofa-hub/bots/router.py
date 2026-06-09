import re

from bots.bot_loader import ROUTER_BOT_ID, SPECIALIST_BOT_IDS, get_bot, BotConfig, BOT_DISPLAY_NAMES


VALID_ROUTES = {"tourism", "culture", "language", "general", "decline"}

ROUTE_TO_SKILL: dict[str, str] = {
    "tourism": "tourism-maame-yaa_bot",
    "culture": "culture-osei-tutu_bot",
    "language": "language-obaa-sarpongmaa_bot",
    "general": "general-nana-kwame_bot",
}


def parse_route(text: str) -> tuple[str, str, bool]:
    match = re.search(r"^ROUTE:\s*(\w+)\s*$", text, re.MULTILINE)
    if match:
        route = match.group(1).strip().lower()
        if route not in VALID_ROUTES:
            route = "general"
        cleaned = re.sub(r"^ROUTE:\s*\w+\s*$\n?", "", text, flags=re.MULTILINE).strip()
        return route, cleaned, True
    return "general", text, False


def resolve_bot(route: str) -> tuple[str, BotConfig]:
    if route == "decline":
        return ROUTER_BOT_ID, get_bot(ROUTER_BOT_ID)
    if route in SPECIALIST_BOT_IDS:
        return SPECIALIST_BOT_IDS[route], get_bot(SPECIALIST_BOT_IDS[route])
    return ROUTER_BOT_ID, get_bot(ROUTER_BOT_ID)


def get_display_name(skill_id: str) -> str:
    return BOT_DISPLAY_NAMES.get(skill_id, "Sankofa Hub")