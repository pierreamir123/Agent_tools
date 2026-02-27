.PHONY: run test install clean lint

CONDA_ENV = AIMYK1
PYTHON = python3
PIP = pip
UVICORN = uvicorn

install:
	$(PIP) install -r requirements.txt

run:
	$(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --reload

lint:
	$(PYTHON) -m ruff check .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
