use askama_actix::Template;
use actix_web::{get, web, App, HttpServer, Responder, HttpResponse};
use serde_derive::Deserialize;
use reqwest::Error;
use serde_json::Value;


#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate<'a> {
    title: &'a str,
    data: &'a Value,
}

#[derive(Deserialize)]
struct FormData {
    // form fields
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
        data: &Value::Null,
    };
    template.render()
}

#[get("/get-data")]
async fn get_data() -> impl Responder {
    let response = reqwest::get("http://localhost:8000/api/all_jobs").await.expect("error");

    if response.status().is_success() {
        let body = response.text().await.expect("error");
        println!("Response body: {}", body);

        let parsed_data: Value = serde_json::from_str(&body).expect("error parsing JSON");

        match render_index_template_with_data(&parsed_data) {
            Ok(rendered) => HttpResponse::Ok().body(rendered),
            Err(err) => {
                eprintln!("Error rendering template: {}", err);
                HttpResponse::InternalServerError().finish()
            }
        }
    } else {
        println!("Request failed with status code: {}", response.status());
        HttpResponse::InternalServerError().finish()
    }
}

fn render_index_template_with_data(data: &Value) -> Result<String, askama::Error> {
    let template = IndexTemplate {
        title: "My Rust App Frontend",
        data: data,
    };
    template.render()
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
