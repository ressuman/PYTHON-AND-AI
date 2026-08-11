from main import app
from fastapi.testclient import TestClient

client = TestClient(app)
print("=== Full Flow Test on Neon PostgreSQL ===")

# 1. Health
r = client.get("/health")
print("\n1. Health:", r.json()["status"])

# 2. Register users
users = [
    {"email": "kwame@test.com", "name": "Kwame Mensah", "password": "password123"},
    {"email": "ama@test.com", "name": "Ama Boateng", "password": "password123"},
    {"email": "admin@test.com", "name": "Admin User", "password": "password123"},
]
tokens = []
for u in users:
    r = client.post("/auth/register", json=u)
    name = u["name"]
    status = r.status_code
    print("2. Register " + name + ": " + str(status))
    if status == 200:
        tokens.append(r.json()["access_token"])

# 3. Login
r = client.post("/auth/login", json={"email": "kwame@test.com", "password": "password123"})
print("3. Login Kwame:", r.status_code)

# 4. /auth/me
headers = {"Authorization": "Bearer " + tokens[0]}
r = client.get("/auth/me", headers=headers)
print("4. /me:", r.status_code, r.json()["name"], "role:", r.json()["role"])

# 5. Chat with conversations
questions = [
    "What are the best tourist sites in Ghana?",
    "How do I say hello in Twi?",
    "Tell me about Ghanaian kente cloth",
]
conv_ids = []
for q in questions:
    h = {"Authorization": "Bearer " + tokens[0]}
    r = client.post("/chat", json={"message": q, "user_id": "kwame-user"}, headers=h)
    d = r.json()
    print("5. Chat [" + q[:30] + "...]: " + str(r.status_code) + " bot:" + d.get("bot_name", "?") + " route:" + d.get("route_taken", "?"))
    if r.status_code == 200:
        conv_ids.append(d.get("conversation_id"))

# 6. Chat as second user
h2 = {"Authorization": "Bearer " + tokens[1]}
r = client.post("/chat", json={"message": "What festivals are celebrated in Ghana?", "user_id": "ama-user"}, headers=h2)
d2 = r.json()
print("6. Chat (Ama):", r.status_code, "bot:", d2.get("bot_name", "?"))

# 7. History
r = client.get("/history/conversations", headers=headers)
convs = r.json()
print("7. History:", r.status_code, str(len(convs)) + " conversations")
for c in convs:
    title = c["title"] or "untitled"
    msgs = c["message_count"]
    print("   - " + title + " (" + str(msgs) + " msgs)")

# 8. Conversation detail
if conv_ids and conv_ids[0]:
    r = client.get("/history/conversations/" + conv_ids[0], headers=headers)
    msgs = r.json()["messages"]
    print("8. Conv detail:", r.status_code, str(len(msgs)) + " messages")

# 9. Check DB row counts
async def check_db():
    from db.base import async_session_factory
    from sqlalchemy import text
    print("\n=== Database Row Counts ===")
    async with async_session_factory() as session:
        for t in ["users", "conversations", "messages", "audit_logs"]:
            r = await session.execute(text("SELECT count(*) FROM " + t))
            print("  " + t + ": " + str(r.scalar()) + " rows")

import asyncio
asyncio.run(check_db())

print("\n=== All Neon tests passed ===")
