use diesel::prelude::*;
use crate::schema::jobs;
use serde::{Serialize, Deserialize};
use diesel::pg::PgConnection;
use diesel::dsl::exists;
use dotenvy::dotenv;
use std::env;
use uuid::Uuid;


fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::jobs)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Jobs {
    pub id: String,
    pub status: String,
    pub title: String,
    pub company: String,
    pub url: String,
    pub location: String,
    pub note: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Jobs {
    pub async fn create(mut job: Jobs) -> Result<Self, String> {
        let mut connection = establish_connection();
        
        job.id = Uuid::new_v4().to_string();    // Assign random id
        
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

    pub async fn find(id: String) -> Result<Self, String> {
        let mut connection = establish_connection();
        let job = jobs::table.filter(jobs::id.eq(id)).first(&mut connection).expect("Error while retrieving job from DB");
        Ok(job)
    }

    pub async fn update(job: Jobs) -> Result<Self, String> {
        let mut connection = establish_connection();
        let updated_job = diesel::update(jobs::table)
            .filter(jobs::id.eq(&job.id))
            .set(&job)
            .get_result(&mut connection).expect("Error while updating job in DB");
        Ok(updated_job)
    }

    pub async fn delete(id: String) -> Result<usize, String> {
        let mut connection = establish_connection();
        let res = diesel::delete(jobs::table.filter(jobs::id.eq(id))).execute(&mut connection).expect("Error while deleting job");
        Ok(res)
    }
}
