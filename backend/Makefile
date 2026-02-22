.PHONY: run test install clean lint

CONDA_ENV = AIMYK1
PYTHON = conda run -n $(CONDA_ENV) python3
PIP = conda run -n $(CONDA_ENV) pip
UVICORN = conda run -n $(CONDA_ENV) uvicorn

install:
	$(PIP) install -r requirements.txt

run:
	$(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --reload

lint:
	$(PYTHON) -m ruff check .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
