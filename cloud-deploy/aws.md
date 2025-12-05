# Deploy IDGAF Chain on AWS (Free Tier)

AWS Free Tier gives you 12 months of free EC2 instance.

## Step 1: Create AWS Account

1. Go to https://aws.amazon.com
2. Sign up (requires credit card, but won't charge for free tier)
3. Verify your account

## Step 2: Launch EC2 Instance

### 2.1 Choose Instance

1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Name: `idgaf-chain-node`
4. AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
5. Instance type: `t2.micro` (Free tier)
6. Key pair: Create new or use existing

### 2.2 Configure Security Group

Add rules:
- SSH (22): Your IP
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (8545): 0.0.0.0/0 (RPC)
- Custom TCP (8546): 0.0.0.0/0 (WebSocket)
- Custom TCP (30303): 0.0.0.0/0 (P2P)

### 2.3 Launch

1. Review and launch
2. Download key pair
3. Wait for instance to be running

## Step 3: Connect to Instance

```bash
# Windows (use WSL or Git Bash)
ssh -i your-key.pem ubuntu@your-instance-ip

# Or use AWS Systems Manager Session Manager (no SSH key needed)
```

## Step 4: Setup Node

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Clone repository (or upload files)
git clone <your-repo> idgaf-chain
cd idgaf-chain/node-setup

# Deploy
./deploy-node.sh
```

## Step 4: Setup Domain (Optional)

1. Go to Route 53 (or your DNS provider)
2. Create A record: `rpc.idgaf.chain` → Your EC2 IP
3. Setup SSL with Let's Encrypt

## Step 5: Setup Auto-start

```bash
# Create systemd service
sudo nano /etc/systemd/system/idgaf-chain.service
# (Use the service file from node-setup/README.md)

sudo systemctl enable idgaf-chain
sudo systemctl start idgaf-chain
```

## Free Tier Limits

- 750 hours/month of t2.micro
- 30GB storage
- 2 million I/O requests
- Valid for 12 months

## Cost After Free Tier

- t2.micro: ~$8-10/month
- Storage: ~$0.10/GB/month
- Data transfer: First 1GB free, then ~$0.09/GB

## Tips

- Use AWS CloudWatch for monitoring
- Setup auto-scaling if needed
- Use Elastic IP for static IP
- Enable detailed monitoring

