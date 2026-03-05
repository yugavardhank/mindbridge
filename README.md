# MindBridge — Phase 1 Setup

## Prerequisites
- Python 3.10+
- Node.js 18+
- Git
- VS Code
- Sarvam AI API key → https://dashboard.sarvam.ai/

---

## Step 1 — Clone & Open in VS Code
```
git clone <your-repo-url>
cd mindbridge
code .
```

## Step 2 — Backend Setup (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

## Step 3 — Add your API key
Create a file called `.env` inside `backend/`:
```
SARVAM_API_KEY=your_key_here
DATABASE_URL=sqlite:///./mindbridge.db
SECRET_KEY=changethis_to_a_random_string
```

## Step 4 — Run database migrations
```powershell
python -m scripts.init_db
```

## Step 5 — Start the backend
```powershell
uvicorn main:app --reload --port 8000
```

## Step 6 — Frontend Setup (new terminal)
```powershell
cd frontend
npm install
npm run dev
```

## Step 7 — Open the app
Go to: http://localhost:3000

---

## Phase 1 Milestone Check
- [ ] Backend runs on port 8000
- [ ] `/health` endpoint returns OK
- [ ] `/api/chat` accepts a message and returns AI therapy response
- [ ] Frontend loads and shows chat interface
- [ ] Sarvam AI responds in the chat

---

## Get your Sarvam API key
1. Go to https://dashboard.sarvam.ai/
2. Sign up (you get ₹1000 free credits)
3. Create an API key
4. Paste it in `backend/.env`