#!/bin/bash
# Instala frontend
cd frontend
npm install
npm run build
cd ..

# Instala backend
cd backend
pip install -r requirements.txt

# Inicia backend (ajuste o comando conforme seu main.py)
uvicorn main:app --host 0.0.0.0 --port $PORT
