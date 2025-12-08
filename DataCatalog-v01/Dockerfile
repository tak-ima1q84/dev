FROM oven/bun:1.3-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application files
COPY . .

# Create backups directory
RUN mkdir -p backups

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "server.ts"]
