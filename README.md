# Job Application Tracker

### Local Setup
Clone repo
```bash
git clone https://github.com/borelli28/Jobs.git
```

Cd into project
```bash
cd Jobs
```

##### Backend
Cd into backend
```bash
cd Backend
```

Create .env in /backend
```bash
echo "JWT_SECRET_KEY=$(openssl rand -base64 32)" > .env && \
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env && \
echo "ASPNETCORE_ENVIRONMENT=Development" >> .env && \
echo "ALLOWED_ORIGINS=http://localhost:3000" >> .env && \
echo "DB_PATH=jobs.db" >> .env && \
echo "FILES_PATH=./files" >> .env
```

Run database migrations
```bash
dotnet ef database update
```

Run app server
```bash
dotnet run
```

##### Frontend
Setup frontend in a new tab
```bash
cd ../Frontend && bun install
```
or use NPM
```bash
cd ../Frontend && npm install
```

Create .env in /frontend
```bash
echo "VITE_BACKEND_API_URL=http://localhost:5000/api" >> .env
```
Or whatever your backend URL is...

Start frontend server
```bash
bun dev
```
or use NPM
```bash
npm run dev
```

Open browser in http://localhost:3000/register

### Production Setup

To quickly configure the environment for production and bundle both the frontend and backend, follow these steps:

#### 1. Run the `setup_prod.sh` Script

Make sure you're in the root directory of the project (`/Jobs/`). Then, run the `setup_prod.sh` script to set up your environment variables, build the frontend, and publish the backend.

```bash
./setup_prod.sh
```

#### 2. Script Details

- **Backend Setup**:  
  The script will generate a secure JWT and encryption key, and create a `.env` file in the `/Backend` directory with the necessary configuration (including database path, allowed origins, and environment variables).
  
- **Frontend Setup**:  
  It will create a `.env` file in the `/Frontend` directory to link the frontend to the backend API. The script will also install frontend dependencies using `bun` or `npm` and then build the frontend assets.

- **Backend Publish**:  
  The backend will be published and output to the `jobs-bundle/backend-publish` directory, prepared for deployment.

- **Frontend Build**:  
  The script moves the built frontend assets to the `jobs-bundle/dist` directory.

Once the script completes successfully, you’ll have both the frontend and backend ready for production, bundled in `jobs-bundle`.
