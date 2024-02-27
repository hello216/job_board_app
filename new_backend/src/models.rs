use diesel::prelude::*;
use crate::schema::users;
use serde::{Serialize, Deserialize};
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

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};

pub async fn hash(password: &[u8]) -> String {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password, &salt)
        .expect("Unable to hash password.")
        .to_string()
}

#[derive(Insertable)]
#[diesel(table_name = users)]
pub struct NewUser<'a> {
    pub username: &'a str,
    pub password: &'a str,
}

#[derive(Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password: String,
}


impl NewUser {

    pub async fn create(user: User) -> Result<Self, String> {
        let mut conn = db::connection()?;
        // Hash the password before storing it
        let hashed_password = hash(user.password.as_bytes()).await;
        
        let user = User {
            username: user.username,
            password: hashed_password,
            ..user
        };
        
        // Check username not in DB before creating
        let username = &user.username;  // Allows the username String to be copied
        let user_already_exists = diesel::select(exists(users::table.filter(users::username.eq(username))))
            .get_result(&mut conn)?;
        
        if user_already_exists {
            Err(CustomError::new(409, String::from("Username already exists in the database")))
        } else {
            // Insert the user into the database
            let inserted_user = diesel::insert_into(users::table)
                .values(&user)
                .get_result(&mut conn)?;
            Ok(inserted_user)
        }
    }
}

// impl User {

//     pub fn find(id: i32) -> Result<Self, CustomError> {
//         let mut conn = db::connection()?;
//         let user = users::table.filter(users::id.eq(id)).first(&mut conn)?;
//         Ok(user)
//     }
    
//     pub fn find_by_username(username: &String) -> Result<Self, CustomError> {
//         let mut conn = db::connection()?;
//         let user = users::table.filter(users::username.eq(username)).first(&mut conn)?;
//         Ok(user)
//     }

//     // TODO: Implement password hashing for update to user.password
//     pub fn update(id: i32, user: User) -> Result<Self, CustomError> {
//         let mut conn = db::connection()?;
//         let user = diesel::update(users::table)
//             .filter(users::id.eq(id))
//             .set(user)
//             .get_result(&mut conn)?;
//         Ok(user)
//     }

//     pub fn delete(id: i32) -> Result<usize, CustomError> {
//         let mut conn = db::connection()?;
//         let res = diesel::delete(users::table.filter(users::id.eq(id))).execute(&mut conn)?;
//         Ok(res)
//     }
// }
