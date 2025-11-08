# 🚀 Quick Start Guide

Get your Grace Akinsira Memorial website deployed in 5 minutes!

## ✅ Prerequisites Checklist

- [ ] GitHub account
- [ ] Linux server with SSH access
- [ ] Docker installed on server
- [ ] Domain pointed to server (optional, can use IP)

## 📋 Step-by-Step Deployment

### Step 1: Setup GitHub Repository (2 minutes)

1. **Push this code to GitHub:**
   ```bash
   cd /home/crypt/Desktop/code/personal/grandma
   git init
   git add .
   git commit -m "Initial commit - Grace Akinsira Memorial"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/grace-akinsira-memorial.git
   git push -u origin main
   ```

2. **Add GitHub Secrets:**
   - Go to: `Repository → Settings → Secrets and variables → Actions`
   - Click "New repository secret" and add:

   | Name | Value | Example |
   |------|-------|---------|
   | `SERVER_HOST_IP` | Your server IP | `123.456.789.0` |
   | `SERVER_USERNAME` | SSH username | `ubuntu` or `root` |
   | `SSH_KEY` | Private SSH key | Copy entire `~/.ssh/id_rsa` content |

### Step 2: Setup Server (3 minutes)

SSH into your server and run these commands:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker compose
sudo chmod +x /usr/local/bin/docker compose

# Verify installations
docker --version
docker compose --version

# Create deployment directory
mkdir -p ~/grace-akinsira/infra/deployments/data

# Open firewall port (if using UFW)
sudo ufw allow 2025

# Log out and back in for docker group
exit
```

### Step 3: Deploy! (Automatic)

Push to GitHub and watch the magic happen:

```bash
git push origin main
```

**GitHub Actions will:**
- ✅ Build Docker image
- ✅ Deploy to server
- ✅ Start application
- ✅ Verify health

**Monitor progress:**
- Go to GitHub → Actions tab
- Watch deployment logs in real-time

### Step 4: Access Your Site

**🌐 Website is live at:**
```
http://YOUR_SERVER_IP:2025/
```

**📊 Admin Panel:**
```
http://YOUR_SERVER_IP:2025/admin
```

**Default login:**
- Username: `admin`
- Password: `VeryVerySecure!`

**⚠️ Change password immediately!**

## 🔧 Optional: Setup Domain & HTTPS

### Setup Nginx Reverse Proxy

```bash
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/graceakinsira
```

Paste this:

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
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/graceakinsira /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d graceakinsira.siteownr.com
```

**Done! Your site is now:**
```
https://graceakinsira.siteownr.com/
https://graceakinsira.siteownr.com/admin
```

## ⚙️ Change Admin Password

### Option 1: Using Environment Variable

1. Generate hash:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
   ```

2. Update on server:
   ```bash
   ssh user@server
   cd ~/grace-akinsira/infra/deployments
   nano docker compose.yml
   ```

3. Change this line:
   ```yaml
   - ADMIN_PASSWORD_HASH=YOUR_GENERATED_HASH
   ```

4. Restart:
   ```bash
   docker compose down
   docker compose up -d
   ```

## 📱 Test Everything

### Check Health
```bash
curl http://YOUR_SERVER_IP:2025/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T...",
  "environment": "production"
}
```

### View Logs
```bash
ssh user@server
cd ~/grace-akinsira/infra/deployments
docker compose logs -f
```

### Check Container Status
```bash
docker compose ps
```

Should show:
```
NAME                       STATUS
grace-akinsira-memorial    Up X minutes (healthy)
```

## 🎉 You're Live!

Your memorial website is now:
- ✅ Running on your server
- ✅ Accessible via browser
- ✅ Automatically deploying on git push
- ✅ Data persisting across restarts
- ✅ Admin panel secured with login

## 🔄 Making Updates

Just push to GitHub:

```bash
# Make changes to code
git add .
git commit -m "Update memorial content"
git push origin main
```

**GitHub Actions automatically deploys updates!**

## 💾 Backup Data

```bash
# Backup messages from server
scp user@server:~/grace-akinsira/infra/deployments/data/messages.json ./backup-$(date +%Y%m%d).json
```

## 🆘 Quick Troubleshooting

### Site not accessible?
```bash
# Check if container is running
ssh user@server
docker ps

# Restart if needed
cd ~/grace-akinsira/infra/deployments
docker compose restart
```

### Can't login to admin?
1. Check credentials: `admin` / `VeryVerySecure!`
2. Clear browser cache
3. Check server logs: `docker compose logs`

### Need to restart?
```bash
ssh user@server
cd ~/grace-akinsira/infra/deployments
docker compose restart
```

## 📞 Quick Commands Reference

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Start
docker compose up -d

# Check status
docker compose ps

# View messages
cat ~/grace-akinsira/infra/deployments/data/messages.json
```

## 🎯 What's Next?

1. ✅ Share the URL with family and friends
2. ✅ Test the guest book
3. ✅ Login to admin panel
4. ✅ Change the default password
5. ✅ Setup domain and HTTPS (optional)
6. ✅ Configure automated backups

---

**That's it! Your memorial website is live and ready to honor Grace Akinsira's legacy.** 👑

For detailed documentation:
- **[README.md](README.md)** - Full documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment details
- **[FEATURES.md](FEATURES.md)** - All features

**Questions? Check the logs or docs above!**
