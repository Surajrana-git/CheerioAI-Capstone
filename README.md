# CheerioAI - Multi-Channel Engagement Platform

## 🎯 The Problem
In today's fast-paced digital landscape, businesses struggle to maintain cohesive communication across multiple channels (Email, SMS, WhatsApp). Marketing teams often rely on fragmented tools, leading to inefficient campaigns, inconsistent messaging, and poor analytics tracking.

## 💡 Our Solution
CheerioAI is a highly optimized, enterprise-grade AI-powered broadcasting platform. It provides a centralized, full-stack SaaS solution that enables users to manage, automate, and track multi-channel marketing campaigns from a single, intuitive dashboard. With built-in AI copy generation, real-time messaging integration, and dynamic analytics, CheerioAI streamlines the entire communication pipeline.

## 🚀 Tech Stack & Languages Used

### Frontend Architecture
* **Core Languages:** Pure HTML5, Vanilla JavaScript, and advanced CSS3.
* **Aesthetics:** Custom CSS Grid/Flexbox layouts featuring Glassmorphism, fluid interactive Web Animations, and modular component design.
* **Data Visualization:** `Chart.js` for rendering interactive Line and Doughnut charts.

### Backend Infrastructure
* **Core Language:** Python 3
* **Framework:** **FastAPI** (High-performance REST API web framework)
* **Server:** **Uvicorn** (ASGI server for asynchronous operations)
* **Database:** **SQLite3** (Lightweight, persistent relational database)
* **Integrations:** `smtplib` for secure Email delivery and `python-dotenv` for environment management.

---

## ✨ Key Features

1. **Real-Time Messaging:** Integrated SMTP for real-time email delivery with secure `.env` configurations.
2. **AI Campaign Assistant:** Automatically generates hyper-contextual marketing copy based on text prompts.
3. **Advanced Analytics Engine:** A visual dashboard tracking platform metrics with variable historical timeframes (`30d`, `90d`, `1yr`).
4. **Data Portability:** Seamless CSV import and export capabilities via backend APIs.
5. **Architectural Security:** State managed fully over REST APIs with secure credential loading, completely decoupled from local storage vulnerabilities.

---

## 💻 How to Run Locally

1. Create a `.env` file in the root directory and add your credentials:
   ```env
   GMAIL_SENDER_EMAIL=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   TEST_RECIPIENT_EMAIL=your_test_email@gmail.com
   ```
2. Install Dependencies: `pip install -r requirements.txt`
3. Start Server: `uvicorn main:app --port 8000 --reload`
4. Navigate to `http://localhost:8000`

---

**This project is made by Suraj Kumar and Tanishk Kumar from IIT Patna**
