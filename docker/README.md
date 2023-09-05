# DockerSpawner with JHub Apps

## Build JHub Image

This is will used as image for DockerSpawner

```bash
docker build -t jhub -f Dockerfile.jhub .
```

## Build and Run JupyterHub

```bash
docker compose build
docker compose up
```

Go to http://127.0.0.1:8000
