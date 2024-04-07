use diesel::prelude::*;
use crate::schema::jobs;
use serde::{Serialize, Deserialize};
use diesel::pg::PgConnection;
use diesel::dsl::exists;
use dotenvy::dotenv;
use std::env;
use uuid::Uuid;
use chrono::Utc;
use sanitize_html::sanitize_str;
use sanitize_html::rules::predefined::DEFAULT;
use std::error::Error;


fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = jobs)]
pub struct Jobs {
    pub id: String,
    pub status: String,
    pub title: String,
    pub company: String,
    pub url: String,
    pub location: String,
    pub note: Option<String>,
    pub created_at: String
}

impl Jobs {
    async fn sanitize_inputs(mut job: Jobs) -> Jobs {
        job.status = sanitize_str(&DEFAULT, &mut job.status).expect("Error while sanitizing status");
        job.title = sanitize_str(&DEFAULT, &mut job.title).expect("Error while sanitizing title");
        job.company = sanitize_str(&DEFAULT, &mut job.company).expect("Error while sanitizing company");
        job.url = sanitize_str(&DEFAULT, &mut job.url).expect("Error while sanitizing url");
        job.location = sanitize_str(&DEFAULT, &mut job.location).expect("Error while sanitizing location");
        match job.note {
            Some(ref mut note) => {
                job.note = Some(sanitize_str(&DEFAULT, note).expect("Error while sanitizing note"));
            }
            None => {
                println!("No note");
            }
        }
        return job
    }

    pub async fn create(job: Jobs) -> Result<Self, Box<dyn Error>> {
        let mut connection = establish_connection();
        let mut _job = Self::sanitize_inputs(job).await;
    
        _job.id = Uuid::new_v4().to_string();
        let current_time = Utc::now();
        _job.created_at = current_time.format("%Y-%m-%d %H:%M:%S").to_string();
    
        let job_id_conflict = diesel::select(exists(jobs::table.filter(jobs::id.eq(&_job.id))))
                .get_result::<bool>(&mut connection)
                .map_err(|err| Box::new(err) as Box<dyn Error>)?;
    
        if job_id_conflict {
            Err(String::from("Job id conflict found").into())
        } else {
            let inserted_job = diesel::insert_into(jobs::table)
                .values(&_job)
                .get_result(&mut connection)
                .map_err(|err| {
                    Box::new(err) as Box<dyn Error>
                });
    
            inserted_job
        }
    }

    pub async fn find(id: String) -> Result<Self, Box<dyn Error>> {
        let mut connection = establish_connection();
        let id = sanitize_str(&DEFAULT, &id).expect("Error while sanitizing id in find function");
        let job = jobs::table.filter(jobs::id.eq(id)).first(&mut connection).map_err(|err| {
            Box::new(err) as Box<dyn Error>
        })?;
        Ok(job)
    }

    pub async fn update(job: Jobs) -> Result<Self, Box<dyn Error>> {
        let mut connection = establish_connection(); 
        let mut _job = Self::sanitize_inputs(job).await;
        
        let updated_job = diesel::update(jobs::table)
            .filter(jobs::id.eq(&_job.id))
            .set(&_job)
            .get_result(&mut connection).map_err(|err| {
                Box::new(err) as Box<dyn Error>
            })?;
        Ok(updated_job)
    }

    pub async fn delete(id: String) -> Result<usize, Box<dyn Error>> {
        let mut connection = establish_connection();
        let id = sanitize_str(&DEFAULT, &id).expect("Error while sanitizing id in delete function");
        let res = diesel::delete(jobs::table.filter(jobs::id.eq(id))).execute(&mut connection).map_err(|err| {
            Box::new(err) as Box<dyn Error>
        })?;
        Ok(res)
    }
}