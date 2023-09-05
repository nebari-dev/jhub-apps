# DockerSpawner with JHub Apps

## Build and Run JupyterHub

```bash
docker compose build
```

## Build JHub Image

This is will used as image for DockerSpawner

```bash
docker build -t jhub -f Dockerfile.jhub .
```
