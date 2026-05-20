import os
from pathlib import Path
from openai import OpenAI

SKILL_PATH = Path(__file__).parent / "skill.md"

def load_skill():
    content = SKILL_PATH.read_text(encoding="utf-8")
    start = content.find("---", 3)
    if start != -1:
        return content[start + 3:].strip()
    return content.strip()

def main():
    from dotenv import load_dotenv
    load_dotenv()
    
    system_prompt = load_skill()
    
    client = OpenAI(
        api_key=os.environ.get("OPENROUTER_API_KEY"),
        base_url=os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    )
    
    model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o")
    
    messages = [{"role": "system", "content": system_prompt}]
    
    print("⚡ Energy Sector Chatbot (type 'exit' to quit)\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        
        messages.append({"role": "user", "content": user_input})
        
        response = client.chat.completions.create(
            model=model,
            messages=messages
        )
        
        assistant_reply = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_reply})
        
        print(f"EnergyBot: {assistant_reply}\n")

if __name__ == "__main__":
    main()