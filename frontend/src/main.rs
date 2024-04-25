use actix_web::{get, web, App, HttpServer, Responder};
use askama::Template;


#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate {}

#[get("/")]
async fn index() -> impl Responder {
    let template = IndexTemplate {};
    template.render().unwrap_or_else(|_| "Error rendering template".to_string())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(index)
            .service(actix_files::Files::new("/static", "static"))
    })
    .bind("127.0.0.1:9999")?
    .run()
    .await
}
