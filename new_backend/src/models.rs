use diesel::prelude::*;
use crate::schema::jobs;
use serde::{Serialize, Deserialize};
use diesel::pg::PgConnection;
use diesel::dsl::exists;
use dotenvy::dotenv;
use std::env;
use serde_json::json;


fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable)]
#[diesel(table_name = crate::schema::jobs)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Jobs {
    pub id: i32,
    pub status: String,
    pub title: String,
    pub company: String,
    pub url: String,
    pub location: String,
    pub date_submitted: String,
    pub note: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Jobs {
    pub async fn create(job: Jobs) -> Result<Self, String> {
        let mut connection = establish_connection();

        let _id = &job.id;  // Allows the String to be copied
        let job_already_exists = diesel::select(exists(jobs::table.filter(jobs::id.eq(_id))))
            .get_result(&mut connection).expect("Error occured while checking for existence of job in DB");

        if job_already_exists {
            Err(String::from("Job already exists in the database"))
        } else {
            let inserted_job = diesel::insert_into(jobs::table)
                .values(&job)
                .get_result(&mut connection)
                .expect("Error occured while inserting new job in DB");
            Ok(inserted_job)
        }
    }

    // pub async fn find(id: i32) -> Result<Self, String> {
    //     let mut connection = establish_connection();
    //     let user = users::table.filter(users::id.eq(id)).first(&mut connection).expect("Error while retrieving user from users table");
    //     Ok(user)
    // }

    // pub fn update(id: i32, user: User) -> Result<Self, CustomError> {
    //     let mut conn = db::connection()?;
    //     let user = diesel::update(users::table)
    //         .filter(users::id.eq(id))
    //         .set(user)
    //         .get_result(&mut conn)?;
    //     Ok(user)
    // }

    // pub async fn delete(id: i32) -> Result<usize, String> {
    //     let mut connection = establish_connection();
    //     let res = diesel::delete(users::table.filter(users::id.eq(id))).execute(&mut connection).expect("Error while deleting user");
    //     Ok(res)
    // }
}
