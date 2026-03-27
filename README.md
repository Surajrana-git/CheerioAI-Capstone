# CheerioAI - Multi-Channel Engagement Platform
**IIT Patna Capstone Project - Group No. 63**

CheerioAI is a highly optimized, enterprise-grade AI-powered broadcasting platform. Designed as a production-ready Capstone project, it demonstrates a full-stack SaaS (Software as a Service) application focusing on modern design aesthetics, asynchronous data pipelines, and intelligent campaign management.

## 🚀 Tech Stack Highlights

This project intentionally minimizes heavy frontend frameworks to demonstrate core web API competence, while leveraging a lightning-fast modern Python backend.

### Frontend Architecture
* **Core:** Pure HTML5, Vanilla JavaScript, and advanced CSS3.
* **Aesthetics:** Custom CSS Grid/Flexbox layouts. Features premium visual effects including backdrop-filter Glassmorphism, fluid interactive Web Animations (keyframes), and modular component design (custom Toast Notifications and Modal overlays).
* **Data Visualization:** `Chart.js` for rendering interactive Line and Doughnut charts.

### Backend Infrastructure
* **Core:** Python 3, **FastAPI** (High-performance web framework).
* **Server:** **Uvicorn** (ASGI server for asynchronous operations).
* **Database:** **SQLite3** (Lightweight, persistent relational database for campaigns and logs).
* **Parsing:** Python native `csv` and `io` libraries for secure data ingestion/export.

---

## ✨ Key Features

1. **AI Campaign Assistant (Pipeline Simulator):** Automatically generates hyper-contextual marketing copy based on text prompts (simulating LLM API usage without consuming paid tokens).
2. **Advanced Analytics Engine:** A visual Developer Console tracking platform metrics. Supports variable historical timeframes (`30d`, `90d`, `1yr`) pulling dynamic payload distributions directly from the Python backend.
3. **Data Portability (CSV):** 
   - Backend `POST /import` endpoints parse local CSV uploads seamlessly reading files via the browser `FileReader`.
   - Backend `GET /export` executes SQL table queries and reformats the live database securely into downloadable `.csv` spreadsheets.
4. **Toast Notifications:** A custom built sliding notification pipeline that intercepts backend responses and renders asynchronous success/error DOM elements, fading them naturally instead of hard-blocking the browser.
5. **Architectural Security & Speed:** 
   - State managed fully over REST APIs instead of vulnerable local storage.
   - Built-in Dark Mode & Mobile Responsive Collapsing (Hamburger Menu constraint).

---

## 📡 RESTful API Documentation

The backend exposes a comprehensive set of REST API endpoints built flawlessly on FastAPI.

### General & Analytics
* `POST /api/login`: Validates admin session credentials.
* `GET /api/stats`: Fetches global broadcast statistics (Messages Sent, Active Campaigns).
* `POST /api/stats/increment`: Securely increments message counters in the database.
* `GET /api/analytics?timeframe={30d,90d,1y}`: Returns normalized dataset maps for Chart.js renders.

### Campaigns & Data I/O
* `GET /api/campaigns`: Returns a JSON array of all active campaigns matching schemas.
* `POST /api/campaigns`: Inserts a new multi-channel broadcast campaign.
* `PUT /api/campaigns/{id}`: Partially updates a campaign's name and execution status.
* `GET /api/campaigns/export`: Compiles the active database into a raw HTTP `text/csv` download stream.
* `POST /api/contacts/import`: Parses multi-part blob text (CSV payloads) to simulate inserting bulk thousands of contacts instantly.

### Integrations
* `POST /api/ai/generate`: Receives a JSON prompt payload, runs it through an internal logic tree, and returns optimized marketing drafts.
* `GET /api/logs` & `POST /api/logs`: Event tracking system logging time-stamped broadcast validations.

---

### How to Run Locally

1. Create a Python Virtual Environment: `python3 -m venv venv`
2. Activate: `source venv/bin/activate` *(Mac/Linux)* or `venv\Scripts\activate` *(Windows)*
3. Install Dependencies: `pip install fastapi uvicorn pydantic`
4. Start Server: `uvicorn main:app --port 3000`
5. Navigate to `http://localhost:3000`
