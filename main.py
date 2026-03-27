import sqlite3
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import List, Union, Optional
import csv
import io

app = FastAPI()

DB_PATH = os.path.join(os.path.dirname(__file__), "database.sqlite")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# Init DB
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # users
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
    """)
    cursor.execute("INSERT OR IGNORE INTO users (id, email, password, role) VALUES (1, 'admin@cheerio.tech', 'admin123', 'admin')")
    
    # stats
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY,
            messages_sent INTEGER,
            active_contacts INTEGER,
            delivery_rate REAL,
            pending_campaigns INTEGER
        )
    """)
    cursor.execute("INSERT OR IGNORE INTO stats (id, messages_sent, active_contacts, delivery_rate, pending_campaigns) VALUES (1, 1245890, 48592, 98.5, 24)")
    
    # campaigns
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            channel TEXT,
            sent INTEGER,
            delivered INTEGER,
            status TEXT,
            time TEXT
        )
    """)
    
    # Init campaigns if empty
    cursor.execute("SELECT COUNT(*) as count FROM campaigns")
    if cursor.fetchone()['count'] == 0:
        initial_campaigns = [
            ("Summer Sale Promotion", "Multi-Channel", 45230, 44890, "completed", "2 hours ago"),
            ("Product Launch Alert", "Email + SMS", 12450, 12200, "completed", "5 hours ago"),
            ("Weekly Newsletter", "Email", 89450, 88120, "in-progress", "1 day ago"),
            ("Flash Sale Reminder", "WhatsApp", 23400, 23100, "completed", "2 days ago")
        ]
        cursor.executemany("INSERT INTO campaigns (name, channel, sent, delivered, status, time) VALUES (?, ?, ?, ?, ?, ?)", initial_campaigns)

    # logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            time TEXT
        )
    """)
    
    conn.commit()
    conn.close()

init_db()

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class IncrementRequest(BaseModel):
    messagesCount: Optional[int] = 1

class CampaignRequest(BaseModel):
    name: str
    channel: Union[str, List[str]]
    message: str

class CampaignUpdateRequest(BaseModel):
    name: str
    status: str

class LogRequest(BaseModel):
    text: str

class AIPromptRequest(BaseModel):
    prompt: str

# Endpoints
@app.post("/api/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ? AND password = ?", (req.email, req.password)).fetchone()
    conn.close()
    if user:
        return {"success": True, "user": {"email": user["email"], "role": user["role"]}}
    return {"success": False, "error": "Invalid credentials"}

@app.get("/api/stats")
def get_stats():
    conn = get_db_connection()
    stats = conn.execute("SELECT * FROM stats WHERE id = 1").fetchone()
    conn.close()
    if stats:
        return dict(stats)
    raise HTTPException(status_code=500, detail="Database error")

@app.post("/api/stats/increment")
def increment_stats(req: IncrementRequest):
    conn = get_db_connection()
    count = req.messagesCount if req.messagesCount else 1
    conn.execute("UPDATE stats SET messages_sent = messages_sent + ? WHERE id = 1", (count,))
    conn.commit()
    stats = conn.execute("SELECT * FROM stats WHERE id = 1").fetchone()
    conn.close()
    return dict(stats)

@app.get("/api/campaigns")
def get_campaigns():
    conn = get_db_connection()
    campaigns = conn.execute("SELECT * FROM campaigns ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(c) for c in campaigns]

@app.post("/api/campaigns")
def create_campaign(req: CampaignRequest):
    import random
    channel_str = " + ".join(req.channel) if isinstance(req.channel, list) else req.channel
    
    sent = random.randint(1000, 6000)
    delivered = int(sent * 0.98)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO campaigns (name, channel, sent, delivered, status, time) VALUES (?, ?, ?, ?, ?, ?)",
        (req.name, channel_str, sent, delivered, 'scheduled', 'Just now')
    )
    campaign_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": campaign_id, "name": req.name, "channelStr": channel_str, "sent": sent, "delivered": delivered}

@app.put("/api/campaigns/{campaign_id}")
def update_campaign(campaign_id: int, req: CampaignUpdateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE campaigns SET name = ?, status = ? WHERE id = ?",
        (req.name, req.status, campaign_id)
    )
    conn.commit()
    conn.close()
    return {"success": True}

@app.get("/api/logs")
def get_logs():
    conn = get_db_connection()
    logs = conn.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 20").fetchall()
    conn.close()
    return [dict(l) for l in logs]

@app.post("/api/logs")
def create_log(req: LogRequest):
    time_str = datetime.now().strftime("%I:%M:%S %p")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO logs (text, time) VALUES (?, ?)", (req.text, time_str))
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": log_id, "text": req.text, "time": time_str}

@app.post("/api/ai/generate")
def generate_ai_message(req: AIPromptRequest):
    prompt_lower = req.prompt.lower()
    if "sale" in prompt_lower or "discount" in prompt_lower:
         message = "🚨 FLASH SALE! Grab your favorites at massive discounts before they're gone! Click here to shop now: [Link]"
    elif "welcome" in prompt_lower:
         message = "Hi there! 👋 Welcome to our community. We're thrilled to have you here. Stay tuned for exclusive updates and offers!"
    elif "urgent" in prompt_lower:
         message = "⏳ Time is running out! Action required on your account. Please review your details immediately."
    else:
         message = f"Hello! We have some exciting news regarding '{req.prompt}'. Tap the link to learn more: [Link]"
    return {"success": True, "result": message}

@app.get("/api/analytics")
def get_advanced_analytics(timeframe: str = "30d"):
    import random
    multiplier = 1 if timeframe == "30d" else (3 if timeframe == "90d" else 12)
    base_line = [450, 600, 800, 750, 1100, 1500, 2000]
    line_data = [int(v * multiplier * random.uniform(0.8, 1.2)) for v in base_line]
    
    # Vary doughnut randomly
    d1 = int(55 * random.uniform(0.9, 1.1))
    d2 = int(30 * random.uniform(0.9, 1.1))
    d3 = 100 - d1 - d2
    
    return {
        "lineData": line_data,
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "doughnutData": [max(d1,0), max(d2,0), max(d3,0)],
        "doughnutLabels": ["Email", "SMS", "WhatsApp"]
    }

@app.get("/api/campaigns/export")
def export_campaigns():
    conn = get_db_connection()
    campaigns = conn.execute("SELECT name, channel, sent, delivered, status, time FROM campaigns ORDER BY id DESC").fetchall()
    conn.close()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Channel", "Sent", "Delivered", "Status", "Time"])
    for row in campaigns:
         writer.writerow([row["name"], row["channel"], row["sent"], row["delivered"], row["status"], row["time"]])
         
    return PlainTextResponse(output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=campaign_export.csv"})

@app.post("/api/contacts/import")
async def import_contacts(request: Request):
    content = await request.body()
    try:
        decoded = content.decode('utf-8')
        reader = csv.reader(io.StringIO(decoded))
        rows = list(reader)
        # Assuming header row exists, rows >= 2 means we got data
        added = len(rows) - 1 if len(rows) > 0 else 0
        return {"success": True, "added": added}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Serve static files last so API routes take precedence
app.mount("/", StaticFiles(directory="public", html=True), name="public")
