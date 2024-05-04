use askama_actix::Template;
use actix_web::{get, web, App, HttpServer, Responder, HttpResponse};
use serde_derive::Deserialize;
use reqwest::Error;


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
async fn index() -> impl Responder {
    match render_index_template() {
        Ok(body) => HttpResponse::Ok().body(body),
        Err(err) => {
            eprintln!("Error rendering template: {}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

fn render_index_template() -> Result<String, askama::Error> {
    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data: "",
    };
    template.render()
}

#[get("/get-data")]
async fn get_data(form: web::Form<FormData>) -> impl Responder {
    let data = "This is the data from the backend.";
    let response = reqwest::get("http://localhost:8000/api/all_jobs").await.expect("error");

    if response.status().is_success() {
        let body = response.text().await.expect("error");
        println!("Response body: {}", body);
    } else {
        println!("Request failed with status code: {}", response.status());
    }

    match render_index_template() {
        Ok(body) => HttpResponse::Ok().body(response),
        Err(err) => {
            eprintln!("Error rendering template: {}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
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
