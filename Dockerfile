FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (without postinstall)
RUN bun install --ignore-scripts

# Copy source code
COPY . .

# Build frontend explicitly
RUN bun run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "run", "src/server.ts"]
