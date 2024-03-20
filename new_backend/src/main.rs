use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use diesel::prelude::*;
use crate::models::Jobs;
use crate::schema::jobs::dsl::*;
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
                .route("/create_job", web::post().to(create_job))
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

async fn create_job(job: web::Json<Jobs>) -> impl Responder {    
   let new_job = Jobs::create(job.into_inner()).await;
    HttpResponse::Ok().json(new_job)
}

// async fn all_users() -> impl Responder {
//     let mut connection = establish_connection();
//     let _all_users: Vec<User> = users.load::<User>(&mut connection).expect("Failed to load users");
//     HttpResponse::Ok().json(_all_users)
// }

// async fn get_user() -> impl Responder {
//     // get user from session, jwt, or whatever auth method
//     let user = User::find(1).await;
//     HttpResponse::Ok().json(user)
// }
