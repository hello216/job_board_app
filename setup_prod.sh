#!/bin/bash

# Ensure script runs from the project root
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
  echo "Error: Run this script from the project root (where Backend & Frontend directories exist)."
  exit 1
fi

# Prompt user for required values
read -p "Enter the first part of the database path (e.g., /home/user/): " DB_PATH_PREFIX
read -p "Enter the frontend domain (e.g., subdomain.your-domain.com): " ALLOWED_ORIGINS
read -p "Enter the backend domain (e.g., subdomain.your-domain.com): " BACKEND_API_URL

# Generate Secure 32-character Keys for JWT & Encryption
generate_secure_key() {
  openssl rand 32 | base64 | tr -d '='
}

JWT_SECRET=$(generate_secure_key)
ENCRYPTION_KEY=$(generate_secure_key)

# Backend .env Setup
echo "Setting up Backend .env file..."
cat > Backend/.env <<EOL
JWT_SECRET_KEY=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
ASPNETCORE_ENVIRONMENT=Production
ALLOWED_ORIGINS=https://$ALLOWED_ORIGINS
DB_PATH=${DB_PATH_PREFIX}jobs.db
EOL

echo "✅ Backend .env configured successfully."

# Frontend .env Setup
echo "Setting up Frontend .env file..."
cat > Frontend/.env <<EOL
VITE_BACKEND_API_URL=https://$BACKEND_API_URL/api
EOL

echo "✅ Frontend .env configured successfully."

# Ensure jobs-bundle directory exists
mkdir -p jobs-bundle

# Save environment variables to env-variables.txt
echo "Saving environment variables..."
cat > jobs-bundle/env-variables.txt <<EOL
*** Backend ***
JWT_SECRET_KEY=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
ASPNETCORE_ENVIRONMENT=Production
ALLOWED_ORIGINS=https://$ALLOWED_ORIGINS
DB_PATH=${DB_PATH_PREFIX}jobs.db

*** Frontend ***
VITE_BACKEND_API_URL=https://$BACKEND_API_URL/api
EOL

echo "✅ Environment variables saved successfully."

# Publish Backend
echo "Publishing Backend..."
cd Backend
dotnet publish -c Release -o ../jobs-bundle/backend-publish
cd ..
echo "✅ Backend published successfully."

# Build Frontend
echo "Building Frontend..."
cd Frontend

# Install dependencies first
if command -v bun &> /dev/null; then
  echo "Using bun to install dependencies..."
  bun install
  bun run build
elif command -v npm &> /dev/null; then
  echo "Using npm to install dependencies..."
  npm install
  npm run build
else
  echo "Error: Neither 'bun' nor 'npm' found. Please install one to build the frontend."
  exit 1
fi

# Move frontend build to the correct location
mv dist ../jobs-bundle/dist

cd ..
echo "✅ Frontend built and moved successfully."

echo "🎉 Production setup complete!"