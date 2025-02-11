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
cd Jobs/Backend && echo "JWT_SECRET_KEY=SuperLongSecretKey1234567890123456" > .env && echo "ENCRYPTION_KEY=SomeVerySecretKey32CharactersLong" >> .env && dotnet ef migrations add InitialCreate && dotnet ef database update && dotnet watch run --launch-profile https
```

##### Frontend
Setup frontend in a new tab
```bash
gnome-terminal --tab -- bash -c "cd ../Frontend && bun install && echo 'Frontend setup complete! Starting server...' && bun dev; exec bash"
```
or use NPM
```bash
gnome-terminal --tab -- bash -c "cd ../Frontend && npm install && echo 'Frontend setup complete! Starting server...' && npm run dev; exec bash"
```

Create .env in /frontend
```bash
echo "VITE_BACKEND_API_URL=https://localhost:7190/api" >> .env
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