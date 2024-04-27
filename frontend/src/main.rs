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

#[get("/")]
async fn index() -> Result<impl Responder> {
    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data: "",
    };
    template.render();
}

#[get("/get-data")]
async fn get_data(form: web::Form<FormData>) -> Result<impl Responder> {
    // Process the form data and fetch the data from the backend
    let data = "This is the data from the backend.";

    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data,
    };
    template.render();
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
