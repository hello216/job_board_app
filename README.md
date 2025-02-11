# Job Application Tracker
Simple CRUD app in ASP.NET Core MVC, used to track job applications.

### Setup
Clone repo
```bash
git clone https://github.com/borelli28/Jobs.git
```

##### Backend
Setup backend
```bash
cd Jobs/Backend && echo "JWT_SECRET_KEY=SuperLongSecretKey1234567890123456" > .env && echo "ENCRYPTION_KEY=SomeVerySecretKey32CharactersLong" >> .env && dotnet ef migrations add InitialCreate && dotnet ef database update && dotnet watch run --launch-profile https & gnome-terminal --tab -- bash -c "cd ../Frontend && exec bash"
```

##### Frontend
Setup frontend in a new tab using BUN
```bash
cd Jobs/Frontend && echo "VITE_BACKEND_API_URL=https://localhost:7190/api" > .env && bun install && echo 'Frontend setup complete! Starting server...' && bun dev
```

OR Setup frontend in a new tab using NPM
```bash
cd Jobs/Frontend && echo "VITE_BACKEND_API_URL=https://localhost:7190/api" > .env && npm install && echo 'Frontend setup complete! Starting server...' && npm run dev
```

Open browser in http://localhost:3000/register