# 🎓 LearnAI — Student Learning Outcome Prediction Platform

[![Live Demo](https://img.shields.io/badge/Demo-24%2F7%20Permanent%20Live-brightgreen?style=for-the-badge&logo=pythonanywhere)](https://mayankjariya24.pythonanywhere.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Backend-Django%20REST-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn)](https://scikit-learn.org/)

> An end-to-end AI-powered academic analytics platform designed to predict student performance, detect at-risk students early, and provide actionable interventions using Machine Learning.

---

## 🌐 24/7 Permanent Live URL

🔗 **Public Live Application:**  
👉 **[https://mayankjariya24.pythonanywhere.com](https://mayankjariya24.pythonanywhere.com)**  
*(Runs 24/7 continuously without requiring a laptop to be running — accessible on mobile phones, tablets, and computers worldwide)*

---

## ✨ Key Features

- 📊 **Executive Dashboard:** Real-time KPIs, grade distributions, pass/fail ratios, and at-risk student alerts.
- 🤖 **ML Outcome Prediction:** Predicts student final grades (High Distinction, Distinction, Pass, Fail) with confidence scores using Scikit-Learn.
- 📱 **Fully Responsive:** Custom mobile-first design with drawer navigation (Hamburger menu) for seamless phone use.
- 📋 **Student Directory:** Full CRUD student management with filtering, searching, and risk profiling.
- 📜 **Audit History:** Comprehensive log of all model predictions with export capabilities.
- 📈 **Performance Analytics:** Interactive charts powered by Recharts (attendance vs score, study hours correlation).
- 📁 **CSV Data Transfer:** Batch student upload & bulk report downloads.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router, Recharts, Lucide Icons |
| **Backend API** | Django 5 / 6, Django REST Framework, Django CORS Headers |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib |
| **Database** | SQLite (Academic Records & Prediction Logs) |
| **Deployment / Tunneling** | Cloudflare Tunnel (HTTPS Zero-Config) |

---

## 📁 Project Architecture

```
learnAI/
├── backend/                  # Django REST Framework Backend
│   ├── config/               # Settings, URLs, WSGI
│   ├── students/             # Student records management & API
│   ├── predictions/          # Prediction history & endpoints
│   ├── analytics/            # Statistical analysis & charts API
│   ├── ml/                   # ML training pipelines & inference engine
│   └── dataset/              # Training datasets & seed scripts
├── frontend/                 # React + Vite Modern Frontend
│   └── src/
│       ├── components/       # Responsive Sidebar, Header, Badges
│       ├── pages/            # Dashboard, Predictor, Analytics, etc.
│       └── services/         # Axios/Fetch API client
├── run_project.bat           # 1-Click Localhost Starter (Windows)
├── start_public_live.bat     # 1-Click Public Live URL Starter
└── stop_project.bat          # 1-Click Process Terminator
```

---

## 🚀 Running Locally

### 1. Quick Start (Windows)
Double-click:
- **`run_project.bat`** → Starts localhost on `http://localhost:5173`
- **`start_public_live.bat`** → Generates an instant public HTTPS link for sharing

### 2. Manual Setup

#### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Author
- **Mayank Jariya** — [GitHub Profile](https://github.com/mayankjariya095-rgb)
