import httpx
from typing import Optional

from bots.bot_loader import BOT_REGISTRY, BotConfig, Message


OPENROUTER_API_KEY: Optional[str] = None
OPENROUTER_BASE_URL: Optional[str] = None


def configure(api_key: str, base_url: str, default_model: str = "") -> None:
    global OPENROUTER_API_KEY, OPENROUTER_BASE_URL
    OPENROUTER_API_KEY = api_key
    OPENROUTER_BASE_URL = base_url


async def _chatcompletion(messages: list[dict], models: list[str]) -> str:
    if not OPENROUTER_API_KEY or not OPENROUTER_BASE_URL:
        raise RuntimeError("OpenRouter not configured. Call configure() first.")

    last_error: Exception | None = None
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    for model in models:
        if not model:
            continue
        payload = {"model": model, "messages": messages}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return str(data["choices"][0]["message"]["content"])
        except httpx.TimeoutException:
            last_error = RuntimeError(f"Timeout on {model}")
        except httpx.HTTPStatusError as e:
            last_error = RuntimeError(f"HTTP {e.response.status_code} on {model}: {e.response.text[:200]}")
        except httpx.RequestError as e:
            last_error = RuntimeError(f"Request failed on {model}: {e}")

    raise RuntimeError(f"All models failed. Last error: {last_error}")


def _build_messages(config: BotConfig, history: list[dict]) -> list[dict]:
    messages = [{"role": "system", "content": config.system_prompt}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    return messages


def _get_models(bot_config: BotConfig) -> list[str]:
    models: list[str] = []
    if bot_config.model:
        models.append(bot_config.model)
    if bot_config.fallback_model:
        models.append(bot_config.fallback_model)
    return models


async def chat_with_bot(
    bot_id: str,
    user_message: str,
    history: list[dict],
) -> str:
    config = BOT_REGISTRY[bot_id]
    models = _get_models(config)
    messages = _build_messages(config, history)
    messages.append({"role": "user", "content": user_message})
    return await _chatcompletion(messages, models)