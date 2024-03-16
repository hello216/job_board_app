use diesel::prelude::*;
use crate::schema::users;
use serde::{Serialize, Deserialize};
use diesel::pg::PgConnection;
use diesel::dsl::exists;
use dotenvy::dotenv;
use std::env;
use actix_web::cookie::Cookie;
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use std::time::{SystemTime, UNIX_EPOCH};
use serde_json::json;


fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
    PasswordVerifier,
};

pub async fn hash(_password: &[u8]) -> String {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(_password, &salt)
        .expect("Unable to hash password.")
        .to_string()
}

// pub async fn verify_password(hash: &str, password: &[u8]) -> Result<(), argon2::password_hash::Error> {
//     let parsed_hash = argon2::PasswordHash::new(hash)?;
//     Argon2::default().verify_password(password, &parsed_hash)
// }

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // Subject (whom the token refers to)
    exp: usize,
}

#[derive(Deserialize)]
struct JWT {
    jwt: String,
}

#[derive(Serialize)]
struct UserCookie {
    id: i32,
    jwt_auth: String,
}

fn create_token(username: &str, secret: &[u8]) -> Result<String, String> {
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() + 60 * 60; // Token expires in 1 hour

    let claims = Claims {
        sub: username.to_owned(),
        exp: expiration as usize,
    };
    match encode(&Header::default(), &claims, &EncodingKey::from_secret(secret)){
        Ok(yo) => {
            return Ok(yo)
        },
        Err(_) => {
            let error = String::from("Error arised while encoding token");
            return Err(error)
        },
    }
}

// fn generate_jwt(id: i32, secret: &[u8]) -> Result<String, CustomError> {
//     let user = User::find(id)?;
//     let jwt_token = create_token(&user.username, secret)?;
//     Ok(jwt_token)
// }

// async fn verify_jwt(token: &str) -> Result<HttpResponse, CustomError> {
//     let secret = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY not set in .env file");
//     let jwt_data: Result<jsonwebtoken::TokenData<JWT>, jsonwebtoken::errors::Error> = decode::<JWT>(&token, &DecodingKey::from_secret(secret.as_ref()), &Validation::new(Algorithm::HS256));
    
//     match jwt_data {
//         Ok(_) => Ok(HttpResponse::Ok().body("Token is valid")),
//         Err(_) => Ok(HttpResponse::Unauthorized().body("Token is invalid")),
//     }
// }

#[derive(Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewUser {
    pub username: String,
    pub password: String,
}

impl Queryable<(diesel::sql_types::Integer, diesel::sql_types::Text, diesel::sql_types::Text), diesel::pg::Pg> for NewUser {
    type Row = (i32, String, String);

    fn build(row: Self::Row) -> Result<Self, Box<dyn std::error::Error + Send + Sync + 'static>> {
        Ok(NewUser {
            username: row.1,
            password: row.2,
        })
    }
}

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password: String,
}


impl NewUser {

    pub async fn create(user: NewUser) -> Result<Self, String> {
        let mut connection = establish_connection();
        // Hash the password before storing it
        let hashed_password = hash(user.password.as_bytes()).await;

        let user = NewUser {
            username: user.username,
            password: hashed_password,
            ..user
        };

        // Check username not in DB before creating
        let _username = &user.username;  // Allows the username String to be copied
        let user_already_exists = diesel::select(exists(users::table.filter(users::username.eq(_username))))
            .get_result(&mut connection).expect("Error occured while checking for existence of user in DB");

        if user_already_exists {
            Err(String::from("Username already exists in the database"))
        } else {
            // Insert the user into the database
            let inserted_user = diesel::insert_into(users::table)
                .values(&user)
                .get_result(&mut connection)
                .expect("Error occured while inserting new user in DB");
            Ok(inserted_user)
        }
    }
}

impl User {

    pub async fn find(id: i32) -> Result<Self, String> {
        let mut connection = establish_connection();
        let user = users::table.filter(users::id.eq(id)).first(&mut connection).expect("Error while retrieving user from users table");
        Ok(user)
    }
    
    pub async fn find_by_username(username: &String) -> Result<Self, String> {
        let mut connection = establish_connection();
        let user = users::table.filter(users::username.eq(username)).first(&mut connection).expect("Error while retrieving user from users table");
        Ok(user)
    }

    // // TODO: Implement password hashing for update to user.password
    // pub fn update(id: i32, user: User) -> Result<Self, CustomError> {
    //     let mut conn = db::connection()?;
    //     let user = diesel::update(users::table)
    //         .filter(users::id.eq(id))
    //         .set(user)
    //         .get_result(&mut conn)?;
    //     Ok(user)
    // }

    pub async fn delete(id: i32) -> Result<usize, String> {
        let mut connection = establish_connection();
        let res = diesel::delete(users::table.filter(users::id.eq(id))).execute(&mut connection).expect("Error while deleting user");
        Ok(res)
    }
}
