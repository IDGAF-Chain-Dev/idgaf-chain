# Deploy IDGAF Chain on Fly.io

Fly.io offers generous free tier with global deployment.

## Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

## Step 2: Sign Up

```bash
fly auth signup
# Or go to https://fly.io and sign up
```

## Step 3: Create App

```bash
cd node-setup
fly launch
```

Follow prompts:
- App name: `idgaf-chain-node`
- Region: Choose closest to you
- Postgres: No (unless you need it)

## Step 4: Configure fly.toml

Create `fly.toml`:

```toml
app = "idgaf-chain-node"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[[services]]
  internal_port = 8545
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "1s"
```

## Step 5: Deploy

```bash
fly deploy
```

## Step 6: Get URL

```bash
fly status
# Your RPC: https://idgaf-chain-node.fly.dev
```

## Free Tier

- 3 shared-cpu VMs
- 3GB persistent volumes
- 160GB outbound data transfer
- Great for small to medium nodes

## Tips

- Use `fly scale` to adjust resources
- Monitor with `fly logs`
- Set up health checks

