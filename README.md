# JobAppTracker
Simple CRUD app in ASP.NET Core MVC, used to track job applications(kinda like a spreadsheet, basically just a table).

### Setup
Clone repo
`git clone https://github.com/borelli28/JobAppTracker.git`

Cd into project
`cd JobAppTracker && cd App`

Create migrations
`dotnet ef migrations add InitialCreate`

Apply migrations
`dotnet ef database update`

Run app server
`dotnet watch run`
