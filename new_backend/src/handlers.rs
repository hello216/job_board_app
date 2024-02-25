pub mod user_handlers {
use diesel::pg::PgConnection;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use crate::models::{User, NewUser};
use crate::schema::users::dsl::*;


    pub fn establish_connection() -> PgConnection {
        dotenv().ok();
    
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        PgConnection::establish(&database_url)
            .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
    }

    pub fn all_users() -> Result<Vec<User>, diesel::result::Error> {
        let mut connection = establish_connection();
    
        let all_users: Vec<User> = users.load::<User>(&mut connection)?;
    
        Ok(all_users)
    }
}
