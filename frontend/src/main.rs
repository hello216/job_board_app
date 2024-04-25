use askama_actix::Template;
use actix_web::{web, App, HttpServer};


#[derive(Template)]
#[template(path = "hello.html")]
struct HelloTemplate<'a> {
    name: &'a str,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(web::resource("/").to(|| async { HelloTemplate { name: "world" } }))
    })
    .bind(("127.0.0.1", 9999))?
    .run()
    .await
}
