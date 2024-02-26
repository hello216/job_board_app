use axum::{routing::get, Router};

pub mod models;
pub mod schema;
pub mod handlers;


#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/all_users", get(handlers::all_users()));

    let listener = tokio::net::TcpListener::bind("localhost:8000").await.expect("Something wrong in the listener");
    axum::serve(listener, app).await.expect("Something wrong in the serve fn");
}
