use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use diesel::prelude::*;
use crate::models::{User};
use crate::schema::users::dsl::*;
use diesel::pg::PgConnection;
use dotenvy::dotenv;
use std::env;

pub mod models;
pub mod schema;


fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            web::scope("/api")
                .route("/", web::get().to(index))
                .route("/all_users", web::get().to(all_users))
        )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}

// Route Handlers

async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

async fn all_users() -> impl Responder {
    let mut connection = establish_connection();
    let _all_users: Vec<User> = users.load::<User>(&mut connection).expect("Failed to load users");
    HttpResponse::Ok().json(_all_users)
}

async fn create_user(user: web::Json<User>) -> impl Responder {
    let mut connection = establish_connection();
    
   let new_user = User::create(user.into_inner()).await;
    
    HttpResponse::Ok().json("User created")
}
