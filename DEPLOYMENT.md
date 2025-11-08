# Deployment Guide - Grace Akinsira Memorial

## 🚀 Automated GitHub Actions Deployment

This project includes automated deployment to your server via GitHub Actions.

### Prerequisites

1. A Linux server (Ubuntu/Debian recommended) with:
   - Docker and Docker Compose installed
   - SSH access configured
   - Port 2025 open (or configure Nginx reverse proxy for port 80/443)

2. GitHub repository secrets configured

### Setting Up GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **SERVER_HOST_IP**: Your server's IP address or domain
   ```
   Example: 123.456.789.0
   ```

2. **SERVER_USERNAME**: SSH username
   ```
   Example: ubuntu
   ```

3. **SSH_KEY**: Your private SSH key
   ```bash
   # Generate if you don't have one:
   ssh-keygen -t ed25519 -C "deploy@graceakinsira"

   # Copy the ENTIRE private key (including headers):
   cat ~/.ssh/id_ed25519

   # Add the public key to server's authorized_keys:
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
   ```

### Server Setup

SSH into your server and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker compose
sudo chmod +x /usr/local/bin/docker compose

# Create deployment directory
mkdir -p ~/grace-akinsira/infra/deployments/data

# Log out and back in for docker group to take effect
exit
```

### Initial Deployment

1. Push to the `main` branch:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Build the Docker image
   - Transfer files to server
   - Deploy using docker compose
   - Verify the deployment

3. Monitor deployment:
   - Go to GitHub → Actions tab
   - Click on the running workflow
   - View logs in real-time

### Post-Deployment Setup

1. **Configure Nginx reverse proxy** (recommended for production):

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/graceakinsira
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name graceakinsira.siteownr.com;

    location / {
        proxy_pass http://localhost:2025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/graceakinsira /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

2. **Setup SSL with Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d graceakinsira.siteownr.com
```

3. **Configure DNS**:
   - Point your domain `graceakinsira.siteownr.com` to your server IP
   - Add an A record: `@` → `YOUR_SERVER_IP`

### Managing the Application

#### View Logs
```bash
cd ~/grace-akinsira/infra/deployments
docker compose logs -f
```

#### Restart Application
```bash
cd ~/grace-akinsira/infra/deployments
docker compose restart
```

#### Stop Application
```bash
cd ~/grace-akinsira/infra/deployments
docker compose down
```

#### Start Application
```bash
cd ~/grace-akinsira/infra/deployments
docker compose up -d
```

#### View Container Status
```bash
cd ~/grace-akinsira/infra/deployments
docker compose ps
```

#### Access Messages Data
```bash
# Messages are persisted in:
cd ~/grace-akinsira/infra/deployments/data
cat messages.json
```

#### Backup Messages
```bash
# Create timestamped backup
cp ~/grace-akinsira/infra/deployments/data/messages.json \
   ~/grace-akinsira/messages-backup-$(date +%Y%m%d).json
```

### Admin Access

**Default Credentials:**
- Username: `admin`
- Password: `VeryVerySecure!`

**To change the admin password:**

1. Generate password hash:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
```

2. Update docker compose.yml:
```yaml
environment:
  - ADMIN_USERNAME=your_username
  - ADMIN_PASSWORD_HASH=generated_hash_here
```

3. Restart:
```bash
cd ~/grace-akinsira/infra/deployments
docker compose down
docker compose up -d
```

### Continuous Deployment

Every push to `main` branch triggers automatic deployment:

1. Code is pushed to GitHub
2. GitHub Actions builds new Docker image
3. Image is transferred to server
4. Application is redeployed with zero downtime
5. Old images are cleaned up

### Troubleshooting

#### Deployment Failed

Check GitHub Actions logs:
```
GitHub Repository → Actions → Latest workflow
```

SSH into server and check:
```bash
cd ~/grace-akinsira/infra/deployments
docker compose logs
docker compose ps
```

#### Container Not Starting

```bash
# Check logs
docker compose logs grace-akinsira-memorial

# Check if port is already in use
sudo lsof -i :2025

# Restart Docker
sudo systemctl restart docker
```

#### Messages Not Persisting

Ensure volume is mounted:
```bash
docker compose down
ls -la ~/grace-akinsira/infra/deployments/data/
docker compose up -d
```

#### Can't Access Website

```bash
# Check if container is running
docker compose ps

# Check if port is accessible
curl http://localhost:2025/health

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### Monitoring

#### Health Check
```bash
curl http://localhost:2025/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T...",
  "environment": "production"
}
```

#### Resource Usage
```bash
docker stats grace-akinsira-memorial
```

### Security Recommendations

1. **Change default admin password immediately**
2. **Setup firewall**:
   ```bash
   sudo ufw enable
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Keep Docker updated**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```

4. **Setup automated backups**:
   ```bash
   # Add to crontab
   crontab -e

   # Add line (daily backup at 2 AM):
   0 2 * * * cp ~/grace-akinsira/infra/deployments/data/messages.json ~/backups/messages-$(date +\%Y\%m\%d).json
   ```

5. **Monitor logs regularly**:
   ```bash
   docker compose logs --tail=100
   ```

### Manual Deployment (Without GitHub Actions)

If you prefer manual deployment:

1. **Build locally**:
   ```bash
   docker build -t grace-akinsira-memorial:latest .
   docker save grace-akinsira-memorial:latest | gzip > image.tar.gz
   ```

2. **Transfer to server**:
   ```bash
   scp image.tar.gz user@server:~/grace-akinsira/
   scp infra/deployments/docker compose.yml user@server:~/grace-akinsira/infra/deployments/
   ```

3. **Deploy on server**:
   ```bash
   ssh user@server
   cd ~/grace-akinsira
   docker load < image.tar.gz
   cd infra/deployments
   docker compose up -d
   ```

### Support

For issues or questions:
- Check logs: `docker compose logs`
- Review GitHub Actions workflow runs
- Verify server connectivity and Docker status

---

**Domain**: graceakinsira.siteownr.com
**Port**: 2025
**Admin Panel**: https://graceakinsira.siteownr.com/admin
**Health Check**: https://graceakinsira.siteownr.com/health
