use askama_actix::Template;
use actix_web::{get, web, App, HttpServer, Responder, Result, ResponseError};
use serde_derive::Deserialize;
use std::fmt;


#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate<'a> {
    title: &'a str,
    data: &'a str,
}

#[derive(Deserialize)]
struct FormData {
    // Add any form fields you need to receive from the client
}

#[derive(Debug)]
enum AppError {
    AskamError(askama_actix::Error),
    ActixError(actix_web::Error),
}

impl std::error::Error for AppError {}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::AskamError(e) => write!(f, "Askama error: {}", e),
            AppError::ActixError(e) => write!(f, "Actix-web error: {}", e),
        }
    }
}

impl From<askama_actix::Error> for AppError {
    fn from(err: askama_actix::Error) -> Self {
        AppError::AskamError(err)
    }
}

impl From<actix_web::Error> for AppError {
    fn from(err: actix_web::Error) -> Self {
        AppError::ActixError(err)
    }
}

impl ResponseError for AppError {
    fn status_code(&self) -> actix_web::http::StatusCode {
        match self {
            AppError::AskamError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            AppError::ActixError(e) => e.as_response_error().status_code(),
        }
    }
}

#[get("/")]
async fn index() -> Result<impl Responder, AppError> {
    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data: "",
    };
    template.render().map_err(AppError::from)
}

#[get("/get-data")]
async fn get_data(form: web::Form<FormData>) -> Result<impl Responder, AppError> {
    // Process the form data and fetch the data from the backend
    let data = "This is the data from the backend.";

    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data,
    };
    template.render().map_err(AppError::from)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(index)
            .service(get_data)
    })
    .bind(("127.0.0.1", 9999))?
    .run()
    .await
}
