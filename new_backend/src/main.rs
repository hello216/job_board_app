use axum::{routing::get, Router};


#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { "Hello, World!" }));

    let listener = tokio::net::TcpListener::bind("localhost:8000").await.expect("Something wrong in the listener");
    axum::serve(listener, app).await.expect("Something wrong in the serve fn");
}
