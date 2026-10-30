#!/bin/bash
# Starts a rootless Podman API service on the fixed path the Podman extension reads, then adds sample data.
set -euo pipefail
sudo sysctl -q kernel.apparmor_restrict_unprivileged_userns=0 || true
sudo loginctl enable-linger "$(id -un)"
RUNTIME_DIR="/run/user/$(id -u)"
for _ in $(seq 1 20); do [ -d "$RUNTIME_DIR" ] && break; sleep 1; done
export XDG_RUNTIME_DIR="$RUNTIME_DIR"
echo "XDG_RUNTIME_DIR=$RUNTIME_DIR" >> "$GITHUB_ENV"
mkdir -p "$RUNTIME_DIR/podman"
nohup podman system service --time=0 "unix://$RUNTIME_DIR/podman/podman.sock" > "$RUNNER_TEMP/podman-service.log" 2>&1 &
for _ in $(seq 1 30); do [ -S "$RUNTIME_DIR/podman/podman.sock" ] && break; sleep 1; done
curl -sf --unix-socket "$RUNTIME_DIR/podman/podman.sock" http://d/_ping > /dev/null

for image in docker.io/library/nginx:alpine docker.io/library/redis:alpine docker.io/library/httpd:alpine docker.io/library/alpine:latest quay.io/podman/hello:latest; do
  podman pull -q "$image" > /dev/null || { sleep 20; podman pull -q "$image" > /dev/null; }
done
podman run -d --name web-nginx docker.io/library/nginx:alpine > /dev/null
podman run -d --name cache-redis docker.io/library/redis:alpine > /dev/null
podman run -d --name idle-alpine docker.io/library/alpine:latest sleep infinity > /dev/null
podman create --name stopped-httpd docker.io/library/httpd:alpine > /dev/null
podman run --name exited-hello quay.io/podman/hello:latest > /dev/null 2>&1 || true
podman ps -a
podman images

python3 -c 'import json,subprocess as s
run=lambda *a: s.check_output(a,text=True).split()
print(json.dumps({"containers":run("podman","ps","-a","--format","{{.Names}}"),"images":sorted(set(run("podman","images","--format","{{.Repository}}")))}))' > "$RUNNER_TEMP/expected.json"
cat "$RUNNER_TEMP/expected.json"
