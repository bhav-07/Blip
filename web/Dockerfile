# Base image
FROM node:18
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the entire application code
COPY . ./

# Expose the Next.js dev server port
EXPOSE 3000

# Start the Next.js app in development mode
CMD ["pnpm", "dev"]
