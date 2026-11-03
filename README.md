# 🎓 LearnAI — Student Learning Outcome Prediction Platform

A full-stack AI-powered web application that predicts student learning outcomes using Machine Learning.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Recharts |
| Backend | Django + Django REST Framework |
| ML Model | scikit-learn |
| Database | SQLite |

## 📁 Project Structure

```
learnAI/
├── backend/          # Django REST API + ML pipeline
│   ├── students/     # Student CRUD APIs
│   ├── predictions/  # Prediction history
│   ├── analytics/    # Analytics endpoints
│   ├── ml/           # ML model & predictor
│   └── dataset/      # Training data & seed scripts
├── frontend/         # React + Vite frontend
│   └── src/
│       ├── pages/    # Dashboard, Students, Analytics, etc.
│       ├── components/
│       └── services/ # API calls
├── run_project.bat   # One-click start (Windows)
└── stop_project.bat  # One-click stop (Windows)
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Quick Start (Windows)
Just double-click **`run_project.bat`** to start both servers automatically.

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000

## ✨ Features

- 📊 Student performance dashboard
- 🤖 ML-based learning outcome prediction
- 📈 Analytics & charts
- 📋 Prediction history
- 🧑‍🎓 Student management (CRUD)
- 📤 Data import/export

