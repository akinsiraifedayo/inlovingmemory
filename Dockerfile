# Use Alpine-based Node.js for minimal image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
ENV NODE_ENV=production
RUN npm ci && \
    npm cache clean --force

# Copy application files
COPY config/ ./config/
COPY routes/ ./routes/
COPY views/ ./views/
COPY public/ ./public/
COPY server.js ./

# Create data directory
RUN mkdir -p /app/data && \
    echo '[]' > /app/data/messages.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 2025

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:2025/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "server.js"]
