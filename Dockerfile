FROM node:22-slim

WORKDIR /app

# CI=true skips Husky in the prepare script (.husky/install.mjs checks this)
# and tells the webServer config to always start a fresh server instance
ENV CI=true

# Install dependencies first — separate layer for better cache reuse
COPY package*.json ./
RUN npm ci --ignore-scripts

# Install Chromium and all required system libraries
RUN npx playwright install --with-deps chromium

# Copy application and test source after expensive layers are cached
COPY . .

CMD ["npx", "playwright", "test"]
