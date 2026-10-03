# 14. Setup and Installation

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Seeding Data (Optional)
Run `python seed.py` or the provided `setup_subjects_marks.py` to populate test data.