.PHONY: setup dev install clean test

# Backend variables
CONDA_ENV = AIMYK1
PYTHON = conda run -n $(CONDA_ENV) python3
PIP = conda run -n $(CONDA_ENV) pip
UVICORN = conda run -n $(CONDA_ENV) uvicorn

# Default target
all: dev

# Install dependencies for both frontend and backend
install:
	@echo "Installing backend dependencies..."
	cd backend && $(PIP) install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install

# Setup environment files from examples if they don't exist
setup:
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; echo "Created backend/.env"; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env; echo "Created frontend/.env"; fi

# Run the backend server
dev-backend:
	cd backend && $(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --reload

# Run the frontend server
dev-frontend:
	cd frontend && pnpm run dev

# Run both frontend and backend in parallel (requires 'make -j 2')
dev:
	@echo "Starting full stack app..."
	$(MAKE) -j 2 dev-backend dev-frontend

# Clean up temporary files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/node_modules
	rm -rf frontend/dist
