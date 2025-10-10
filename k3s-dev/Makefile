.PHONY: help up down clean

# Get absolute path to jhub-apps source
JHUB_APPS_SOURCE := $(shell cd .. && pwd)
export JHUB_APPS_SOURCE

help: ## Show this help message
	@echo "JHub Apps K3s Development Environment"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Create cluster and start Tilt (recreates cluster if exists)
	@echo "Setting up JHub Apps development environment..."
	@if k3d cluster list | grep -q jhub-apps-dev; then \
		echo ""; \
		echo "⚠️  Cluster 'jhub-apps-dev' already exists"; \
		read -p "Do you want to delete and recreate it? [y/N] " confirm; \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
			echo "Deleting existing cluster..."; \
			k3d cluster delete jhub-apps-dev; \
		else \
			echo "Using existing cluster..."; \
		fi; \
	fi
	@if ! k3d cluster list | grep -q jhub-apps-dev; then \
		echo "Creating k3d cluster 'jhub-apps-dev'..."; \
		echo "Mounting source from: $(JHUB_APPS_SOURCE)"; \
		k3d cluster create -c k3d-config.yaml --wait; \
		kubectl wait --for=condition=ready node --all --timeout=60s; \
		echo "✓ Cluster ready!"; \
		kubectl get nodes; \
	fi
	@echo ""
	@echo "Starting Tilt..."
	@tilt up

down: ## Stop Tilt and delete cluster
	@echo "Stopping Tilt..."
	@tilt down || true
	@echo "Deleting k3d cluster 'jhub-apps-dev'..."
	@k3d cluster delete jhub-apps-dev || true
	@echo "✓ Environment cleaned up!"

clean: down ## Clean everything (alias for down)

# Default target
.DEFAULT_GOAL := help
