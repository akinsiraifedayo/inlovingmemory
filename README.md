# 👑 Memorial Website for Grace Akinsira

A beautiful, production-ready memorial website with guest book functionality. Built with Node.js, Express, and vanilla JavaScript with full Docker deployment and CI/CD pipeline.

🌐 **Live**: https://graceakinsira.siteownr.com
📊 **Admin**: https://graceakinsira.siteownr.com/admin
🔑 **Default credentials**: `admin` / `VeryVerySecure!`

## 🌟 Features

### Core Features
- ✅ Beautiful, responsive memorial website with animations
- ✅ Interactive guest book with message persistence
- ✅ **Admin dashboard with authentication** (username/password)
- ✅ **Delete messages** from admin panel (requires auth)
- ✅ **Pagination** on both main and admin pages
- ✅ Clean URLs (no .html extensions)
- ✅ **Comprehensive SEO optimization** for search engines
- ✅ Message export functionality
- ✅ Real-time statistics (total, today, this week)
- ✅ Search messages functionality

### Infrastructure & Deployment
- ✅ **Docker containerization** with Alpine Linux (~150MB minimal image)
- ✅ **docker compose.yml** in `infra/deployments/`
- ✅ **Volume persistence** - messages survive container restarts
- ✅ **Port 2025** configuration
- ✅ **GitHub Actions CI/CD** - auto-deploy on push to main
- ✅ **Health checks** and monitoring built-in
- ✅ Production-ready with security headers

### Security & Performance
- 🔒 Authentication required for admin operations
- 🔒 Session-based access control with tokens
- 🔒 Password hashing (SHA-256)
- 🔒 Input validation and XSS protection
- 🔒 Non-root Docker user
- 🔒 CORS configuration
- ⚡ Minimal Docker image size
- ⚡ Efficient pagination
- ⚡ Fast loading with font preconnect

## 📁 Project Structure

```
grandma/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── config/
│   ├── auth.js                 # Authentication system
│   └── config.js               # Configuration management
├── data/
│   └── messages.json           # Guest book messages (auto-generated)
├── infra/
│   └── deployments/
│       └── docker compose.yml  # Production deployment config
├── public/
│   └── assets/
│       ├── images/             # Portrait photos
│       └── videos/             # Memorial video
├── routes/
│   ├── auth.js                 # Authentication endpoints
│   └── messages.js             # Message CRUD + pagination
├── views/
│   ├── index.html              # Main memorial page (with SEO)
│   └── admin.html              # Admin panel (with auth)
├── .dockerignore               # Docker build exclusions
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── DEPLOYMENT.md               # Detailed deployment guide
├── Dockerfile                  # Minimal Alpine-based image
├── FEATURES.md                 # Complete features documentation
├── package.json                # Project dependencies
├── server.js                   # Express server
└── README.md                   # This file
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

**Access locally:**
- Main site: http://localhost:2025/
- Admin panel: http://localhost:2025/admin
- Health check: http://localhost:2025/health

**Default admin credentials:**
- Username: `admin`
- Password: `VeryVerySecure!`

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build Docker image
docker build -t grace-akinsira-memorial:latest .

# Run container with volume persistence
docker run -d \
  -p 2025:2025 \
  -v $(pwd)/data:/app/data \
  --name grace-memorial \
  grace-akinsira-memorial:latest

# Check logs
docker logs grace-memorial

# Check health
curl http://localhost:2025/health
```

### Using Docker Compose

```bash
# Navigate to deployment directory
cd infra/deployments

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 📦 Production Deployment (Automated)

### Setup GitHub Actions

1. **Configure GitHub Secrets** (Repository → Settings → Secrets):
   - `SERVER_HOST_IP`: Your server's IP address
   - `SERVER_USERNAME`: SSH username
   - `SSH_KEY`: Private SSH key for authentication

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **GitHub Actions will automatically:**
   - Build Docker image
   - Transfer to server
   - Deploy to `~/grace-akinsira/`
   - Start containers with docker compose
   - Verify deployment health

### Server Requirements

- Linux server (Ubuntu/Debian recommended)
- Docker and Docker Compose installed
- Port 2025 open (or Nginx reverse proxy)
- SSH access configured

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.**

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=2025
NODE_ENV=production

# Application Settings
APP_NAME="Grace Akinsira Memorial"
DOMAIN=graceakinsira.siteownr.com

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=  # SHA-256 hash (leave empty for default: VeryVerySecure!)

# Storage
MESSAGES_FILE=./data/messages.json

# CORS (production)
ALLOWED_ORIGINS=https://graceakinsira.siteownr.com
```

### Generate Password Hash

```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
```

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/logout` | Logout and invalidate session | Yes |
| GET | `/api/auth/verify` | Verify session token | Yes |

### Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages?page=1&limit=10` | Get paginated messages | No |
| POST | `/api/messages` | Create new message | No |
| DELETE | `/api/messages/:id` | Delete message by ID | **Yes** |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/` | Main memorial page |
| GET | `/admin` | Admin panel |

## 👨‍💼 Admin Panel Features

Access at: `https://graceakinsira.siteownr.com/admin`

- 🔐 Secure login with session management
- 📊 Statistics dashboard (total, today, this week)
- 📄 View all messages with pagination
- 🔍 Search messages by name or content
- 🗑️ Delete messages with confirmation
- 📥 Export all messages to text file
- 🔄 Auto-refresh every 30 seconds
- 🎨 Beautiful UI matching memorial theme

## 💾 Data Management

### Backup Messages

```bash
# Local backup
cp data/messages.json data/messages-backup-$(date +%Y%m%d).json

# Server backup
ssh user@server "cp ~/grace-akinsira/infra/deployments/data/messages.json ~/messages-backup.json"

# Export from admin panel
# Visit /admin → Click "Export as Text" button
```

### Message Format

```json
{
  "id": 1699999999999,
  "name": "John Doe",
  "message": "Beautiful tribute...",
  "date": "November 8, 2025",
  "timestamp": 1699999999999
}
```

## 🔒 Security

### Change Admin Password

1. Generate new password hash:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update('NEW_PASSWORD').digest('hex'))"
   ```

2. Update `.env` or `docker compose.yml`:
   ```env
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD_HASH=generated_hash_here
   ```

3. Restart application

### Security Best Practices

- ✅ Change default admin password immediately
- ✅ Use HTTPS in production (setup SSL with Let's Encrypt)
- ✅ Configure firewall (allow only ports 22, 80, 443)
- ✅ Keep Docker and server updated
- ✅ Setup automated backups
- ✅ Monitor logs regularly
- ✅ Use strong SSH keys

## 🌐 SEO Optimization

The website includes comprehensive SEO:

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags (Facebook sharing)
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Schema.org structured data (Person type)
- ✅ Semantic HTML with proper headings
- ✅ Alt text on images
- ✅ Fast loading with optimizations
- ✅ Mobile-responsive design
- ✅ Sitemap and robots.txt ready

## 🐛 Troubleshooting

### Server won't start
```bash
# Check Node version
node --version  # Should be >= 14.0.0

# Reinstall dependencies
rm -rf node_modules
npm install

# Check port availability
sudo lsof -i :2025
```

### Docker container issues
```bash
# Check logs
docker logs grace-memorial

# Restart container
docker restart grace-memorial

# Check if running
docker ps

# Rebuild image
docker build --no-cache -t grace-akinsira-memorial:latest .
```

### Messages not persisting
```bash
# Check volume mount
docker inspect grace-memorial | grep Mounts -A 10

# Verify data directory permissions
ls -la ~/grace-akinsira/infra/deployments/data/

# Restart with correct volume
docker compose down
docker compose up -d
```

### Cannot access admin panel
- Verify credentials (default: admin / VeryVerySecure!)
- Check browser console for errors (F12)
- Clear localStorage: `localStorage.clear()`
- Check server logs for authentication errors

## 📊 Monitoring

### Health Check

```bash
# Local
curl http://localhost:2025/health

# Production
curl https://graceakinsira.siteownr.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T...",
  "environment": "production"
}
```

### View Logs

```bash
# Docker logs
docker logs -f grace-memorial

# Docker Compose logs
cd ~/grace-akinsira/infra/deployments
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Resource Usage

```bash
# Container stats
docker stats grace-memorial

# Disk usage
docker system df
```

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[FEATURES.md](FEATURES.md)** - Detailed features documentation
- **.env.example** - Environment variables reference

## 🤝 Contributing

This is a personal memorial project. If using as a template:

1. Fork the repository
2. Update content and images
3. Customize colors and styling
4. Configure domain and credentials
5. Deploy to your server

## 📄 License

ISC

## 💝 Dedication

**Created with love for Grace Akinsira**
*Yei Deropo Grace Akinsira*
*A Mother That Left An Empire*

---

## 📞 Quick Reference

| Resource | URL/Command |
|----------|-------------|
| **Website** | https://graceakinsira.siteownr.com/ |
| **Admin Panel** | https://graceakinsira.siteownr.com/admin |
| **Health Check** | https://graceakinsira.siteownr.com/health |
| **Port** | 2025 |
| **Deployment Path** | ~/grace-akinsira/ |
| **Data Path** | ~/grace-akinsira/infra/deployments/data/ |
| **Default User** | admin |
| **Default Pass** | VeryVerySecure! |
| **Docker Image** | grace-akinsira-memorial:latest |
| **Container Name** | grace-akinsira-memorial |

---

**Production-ready memorial website with full CI/CD pipeline** 🚀
**All features implemented and tested** ✅
