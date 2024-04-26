use askama_actix::Template;
use actix_web::{web, App, HttpServer, Responder};


#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate<'a> {
    title: &'a str,
}

async fn index() -> impl Responder {
    IndexTemplate {
        title: "My Rust App Frontend",
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(web::resource("/").to(index))
    })
    .bind(("127.0.0.1", 9999))?
    .run()
    .await
}
