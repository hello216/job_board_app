use askama::Error;
use askama_actix::Template;
use actix_web::{get, web, App, HttpServer, Responder, Result};
use serde_derive::Deserialize;


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
async fn index() -> Result<impl Responder, Error> {
    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data: "", // You can initialize with an empty string here
    };
    Ok(template.render().map_err(Error::into_response)?)
}

#[get("/get-data")]
async fn get_data(form: web::Form<FormData>) -> impl Responder {
    // Process the form data and fetch the data from the backend
    let data = "This is the data from the backend.";

    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data,
    };
    template.render().map_err(Error::into_response).unwrap_or_else(|err| {
        // Handle rendering error
        println!("Error rendering template: {}", err);
        err.into_response()
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
