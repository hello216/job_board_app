# Job Application Tracker
Simple CRUD app in ASP.NET Core MVC, used to track job applications.

### Setup
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
echo "JWT_SECRET_KEY=SuperLongSecretKey1234567890123456" > .env && \
echo "ENCRYPTION_KEY=SomeVerySecretKey32CharactersLong" >> .env && \
echo "ASPNETCORE_ENVIRONMENT=Development" >> .env && \
echo "ALLOWED_ORIGINS=http://localhost:3000" >> .env
```

Create migrations
```bash
dotnet ef migrations add InitialCreate && dotnet ef database update
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
echo "VITE_BACKEND_API_URL=http://localhost:7190/api" >> .env
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
