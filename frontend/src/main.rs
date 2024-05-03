use askama::Error as AskamaError;
use askama_actix::Template;
use actix_web::{get, web, App, HttpServer, Responder, Result, error::ResponseError};
use serde_derive::Deserialize;
use std::fmt;


#[derive(Debug)]
struct CustomError(AskamaError);

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl ResponseError for CustomError {}

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

#[get("/")]
async fn index() -> Result<impl Responder, CustomError> {
    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data: "",
    };
    template.render().map_err(CustomError)
}

#[get("/get-data")]
async fn get_data(form: web::Form<FormData>) -> impl Responder {
    let data = "This is the data from the backend.";

    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data,
    };
    template.render().map_err(CustomError).unwrap_or_else(|err| {
        eprintln!("Error rendering template: {}", err);
        err.into()
    })
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
