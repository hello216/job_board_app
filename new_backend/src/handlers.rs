use axum::{response::Json};
use diesel::prelude::*;
use crate::models::User;
use crate::schema::users::dsl::*;
use diesel::pg::PgConnection;
use dotenvy::dotenv;
use std::env;


fn establish_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub async fn all_users() -> Result<Json<Vec<User>>, diesel::result::Error> {
    let mut connection = establish_connection();

    let all_users: Vec<User> = match users.load::<User>(&mut connection) {
        Ok(loaded_users) => loaded_users,
        Err(e) => return Err(e),
    };

    Ok(Json(all_users))
}
