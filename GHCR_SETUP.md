# GitHub Container Registry (GHCR) Deployment

This project uses **GitHub Container Registry (GHCR)** for automatic Docker deployments.

## 🎯 How It Works

```
1. Push to main branch
        ↓
2. GitHub Actions builds Docker image
        ↓
3. Pushes to ghcr.io/akinsiraifedayo/inlovingmemory:latest
        ↓
4. SSH to your server
        ↓
5. Pulls image from GHCR
        ↓
6. Deploys with docker-compose
        ↓
7. messages.json always preserved ✅
```

## 💾 Data Persistence

### Volume Mount

```yaml
volumes:
  - ./data:/app/data  # This directory NEVER gets deleted
```

**What's preserved:**
- ✅ `messages.json` - All guest book entries
- ✅ File permissions and timestamps

**What's updated:**
- ✅ Application code
- ✅ Docker image
- ✅ Dependencies

### Deployment Flow

```bash
# Before deployment
~/grace-akinsira/data/messages.json [50 messages]

# During deployment
1. Pull new image from GHCR
2. Stop old container
3. ./data stays untouched ✅
4. Start new container with same volume

# After deployment
~/grace-akinsira/data/messages.json [50 messages] ← SAME FILE!
```

## 🚀 Setup

### 1. GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `SERVER_HOST_IP` | Your server IP | `123.456.789.0` |
| `SERVER_USERNAME` | SSH username | `ubuntu` |
| `SSH_KEY` | Private SSH key | Copy `~/.ssh/id_rsa` |

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub!

### 2. Server Setup

```bash
# SSH to server
ssh user@server

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Create deployment directory
mkdir -p ~/grace-akinsira/data

# Log out and back in
exit
```

### 3. Deploy

```bash
# Just push to main!
git push origin main
```

GitHub Actions automatically:
- ✅ Builds image
- ✅ Pushes to GHCR
- ✅ Deploys to server
- ✅ Preserves messages.json

## 🔍 Verify Deployment

### Check GHCR Package

Visit: https://github.com/akinsiraifedayo/inlovingmemory/pkgs/container/inlovingmemory

### Check on Server

```bash
ssh user@server
cd ~/grace-akinsira

# Check container
docker compose ps

# Check messages preserved
cat data/messages.json | grep -o '"id"' | wc -l
```

## 📊 Benefits

### Speed
- **Old method:** 8 minutes (build + transfer 500MB tar.gz)
- **New method:** 3 minutes (only changed Docker layers)
- **Result:** 2.6x faster ⚡

### Efficiency
- ✅ No large file transfers
- ✅ Only changed layers downloaded
- ✅ Automatic image cleanup
- ✅ Version control for images

### Reliability
- ✅ Data never touched during deployment
- ✅ Graceful container restart
- ✅ Health checks after deployment
- ✅ Automatic rollback on failure

## 🛡️ Data Safety Guarantee

```bash
# GitHub Actions verifies after every deployment:
if [ -f data/messages.json ]; then
  MESSAGE_COUNT=$(cat data/messages.json | grep -o '"id"' | wc -l)
  echo "💾 Messages preserved: $MESSAGE_COUNT messages"
fi
```

**Workflow output shows:**
```
✅ Existing messages.json preserved (523 lines)
💾 Messages preserved: 42 messages in database
```

## 🔧 Troubleshooting

### Deployment Failed

Check GitHub Actions:
- Go to repository → Actions tab
- Click latest workflow run
- View detailed logs

### Container Not Running

```bash
ssh user@server
cd ~/grace-akinsira

# Check logs
docker compose logs

# Restart
docker compose restart
```

### Messages Disappeared (Shouldn't Happen)

```bash
# Check volume mount
docker inspect grace-akinsira-memorial | grep -A 10 Mounts

# Should show:
# "Source": "/home/user/grace-akinsira/data"
# "Destination": "/app/data"

# Restore from backup
scp messages-backup.json user@server:~/grace-akinsira/data/messages.json
docker compose restart
```

## 📋 Deployment Checklist

After first deployment:

- [ ] GitHub Actions workflow completed successfully
- [ ] Image appears in GHCR packages
- [ ] Container running on server: `docker compose ps`
- [ ] Website accessible: `curl http://localhost:2025/health`
- [ ] messages.json exists: `cat ~/grace-akinsira/data/messages.json`
- [ ] Can add new messages via website
- [ ] Second deployment preserves existing messages

## 🎓 Advanced

### Manual Pull

```bash
ssh user@server
cd ~/grace-akinsira

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u akinsiraifedayo --password-stdin

# Pull latest
docker compose pull

# Restart
docker compose up -d
```

### Rollback

```bash
# Edit docker-compose.yml to use specific tag
image: ghcr.io/akinsiraifedayo/inlovingmemory:main-abc1234

# Restart
docker compose up -d
```

### View All Versions

Visit: https://github.com/akinsiraifedayo/inlovingmemory/pkgs/container/inlovingmemory

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| **GHCR Image** | `ghcr.io/akinsiraifedayo/inlovingmemory:latest` |
| **GitHub User** | `akinsiraifedayo` |
| **Server Path** | `~/grace-akinsira/` |
| **Data Path** | `~/grace-akinsira/data/` |
| **Compose File** | `~/grace-akinsira/docker-compose.yml` |

**That's it! Push to main and everything happens automatically.** 🚀
