import os
from dotenv import load_dotenv
from openai import OpenAI
import gradio as gr

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = (
    "You are Richy, a warm and responsible AI health assistant. "
    "You are a knowledgeable.You ONLY answer health and medical questions. For anything "
    "unrelated to health, gently redirect the user and invite a "
    "health question.  You exist for one purpose only: to "
    "help people with health-related questions. NEVER diagnose or prescribe. For emergencies "
    "like chest pain or suicidal thoughts, immediately say to call "
    "emergency services (911/999/112). End health answers with: "
    "'Remember, this is general health information only — always "
    "consult a healthcare professional for personal advice.'"
)


def chat(message, history):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in history:
        if isinstance(item, dict):
            messages.append({"role": item["role"], "content": item["content"]})
        else:
            user_msg, assistant_msg = item
            messages.append({"role": "user", "content": user_msg})
            messages.append({"role": "assistant", "content": assistant_msg})
    messages.append({"role": "user", "content": message})
    stream = client.chat.completions.create(
        model="openrouter/free",
        messages=messages,
        stream=True,
    )
    partial = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            partial += delta
            yield partial


css = """
.gradio-container {
    background: linear-gradient(145deg, #f0faf0 0%, #e8f5e8 100%);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
h1 {
    text-align: center;
    color: #2e7d32;
    font-weight: 600;
    font-size: 2.2rem;
    margin-bottom: 0.25rem;
}
footer {
    text-align: center;
    font-size: 0.8rem;
    color: #558b2f;
    padding: 1rem 0 0.5rem 0;
    border-top: 1px solid #c8e6c9;
    margin-top: 1rem;
}
footer p {
    margin: 0.2rem 0;
}
"""

with gr.Blocks() as demo:
    gr.ChatInterface(
        fn=chat,
        title="Richy — Your Health Assistant",
        textbox=gr.Textbox(placeholder="Ask Richy a health question..."),
    )
    gr.HTML("""
        <footer>
            <p>⚠️ Richy is an AI assistant for general health information only.</p>
            <p>Always consult a qualified healthcare professional for personal medical advice.</p>
        </footer>
        """)

if __name__ == "__main__":
    demo.launch(css=css, theme=gr.themes.Soft(primary_hue="green"))
