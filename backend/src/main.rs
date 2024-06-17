use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use diesel::prelude::*;
use crate::models::Jobs;
use crate::schema::jobs::dsl::*;
use diesel::pg::PgConnection;
use dotenvy::dotenv;
use std::env;
use actix_cors::Cors;

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
        let cors = Cors::default()
            .allowed_origin("http://localhost:5218")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(
                web::scope("/api")
                    .route("/", web::get().to(index))
                    .route("/create_job", web::post().to(create_job))
                    .route("/all_jobs", web::get().to(all_jobs))
                    .route("/get_job", web::get().to(get_job))
                    .route("/delete_job", web::delete().to(delete_job))
                    .route("/update_job", web::put().to(update_job))
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}

async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

async fn create_job(job: web::Json<Jobs>) -> impl Responder {    
    match Jobs::create(job.into_inner()).await {
        Ok(job) => return HttpResponse::Ok().json(job),
        Err(_) => return HttpResponse::InternalServerError().json("Error occured while creating job"),
    };
}

async fn all_jobs() -> impl Responder {
    let mut connection = establish_connection();
    let _all_jobs: Vec<Jobs> = jobs.load::<Jobs>(&mut connection).expect("Failed to load jobs");
    HttpResponse::Ok().json(_all_jobs)
}

async fn get_job(data: web::Json<String>) -> impl Responder {
    match Jobs::find(data.0).await {
        Ok(job) => return HttpResponse::Ok().json(job),
        Err(_) => return HttpResponse::InternalServerError().json("Error occured while retrieving job"),
    };
}

async fn update_job(job: web::Json<Jobs>) -> impl Responder {
    match Jobs::update(job.into_inner()).await {
        Ok(job) => return HttpResponse::Ok().json(job),
        Err(_) => return HttpResponse::InternalServerError().json("Error occured while updating job"),
    }
}

async fn delete_job(data: web::Json<String>) -> impl Responder {
    match Jobs::delete(data.0).await  {
        Ok(response) => return HttpResponse::Ok().json(response),
        Err(_) => return HttpResponse::InternalServerError().json("Error occured while deleting job"),
    }
}
