use actix_web::{get, post, web, App, HttpServer, Responder, HttpResponse};
use askama_actix::Template;
use serde::{Serialize, Deserialize};

#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate {
    title: String,
    data: Option<Vec<Job>>,
}

#[derive(Template)]
#[template(path = "new_jobs.html")]
struct NewJobsTemplate {
    title: String,
}

#[derive(Template)]
#[template(path = "edit_job.html")]
struct EditJobTemplate {
    title: String,
    job: Job,
}

#[derive(Deserialize, Serialize)]
struct Job {
    id: String,
    status: String,
    title: String,
    company: String,
    url: String,
    location: String,
    note: Option<String>,
    created_at: String,
}

#[get("/")]
async fn index() -> impl Responder {
    match render_index_template() {
        Ok(body) => HttpResponse::Ok().body(body),
        Err(err) => {
            eprintln!("Error rendering template: {}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

fn render_index_template() -> Result<String, askama::Error> {
    let template = IndexTemplate {
        title: "Job Application Tracker".to_string(),
        data: None,
    };
    template.render()
}

#[get("/new-jobs")]
async fn new_jobs_page() -> impl Responder {
    match render_new_jobs_template() {
        Ok(body) => HttpResponse::Ok().body(body),
        Err(err) => {
            eprintln!("Error rendering template: {}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

fn render_new_jobs_template() -> Result<String, askama::Error> {
    let template = NewJobsTemplate {
        title: "Add New Job Application".to_string(),
    };
    template.render()
}

#[get("/get-jobs")]
async fn get_jobs() -> impl Responder {
    let response = reqwest::get("http://localhost:8000/api/all_jobs").await.expect("error");

    if response.status().is_success() {
        let body = response.text().await.expect("error");
        // println!("Response body: {}", body);

        let parsed_data: Vec<Job> = serde_json::from_str(&body).expect("error parsing JSON");

        match render_index_template_with_data(parsed_data) {
            Ok(rendered) => HttpResponse::Ok().body(rendered),
            Err(err) => {
                eprintln!("Error rendering template: {}", err);
                HttpResponse::InternalServerError().finish()
            }
        }
    } else {
        println!("Request failed with status code: {}", response.status());
        HttpResponse::InternalServerError().finish()
    }
}

fn render_index_template_with_data(data: Vec<Job>) -> Result<String, askama::Error> {
    let template = IndexTemplate {
        title: "Job Application Tracker".to_string(),
        data: Some(data),
    };
    template.render()
}

#[post("/add-job")]
async fn add_job(post_data: web::Form<Job>) -> impl Responder {
    let data = Job {
        id: post_data.id.clone(),
        status: post_data.status.clone(),
        title: post_data.title.clone(),
        company: post_data.company.clone(),
        url: post_data.url.clone(),
        location: post_data.location.clone(),
        note: post_data.note.clone(),
        created_at: post_data.created_at.clone(),
    };

    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:8000/api/create_job")
        .json(&data)
        .send()
        .await
        .expect("error");

    if response.status().is_success() {
        HttpResponse::Found()
            .append_header(("Location", "/"))
            .finish()
    } else {
        println!("Request failed with status code: {}", response.status());
        HttpResponse::InternalServerError().finish()
    }
}

#[get("/edit-job/{id}")]
async fn edit_job(id: web::Path<String>) -> impl Responder {
    let id = id.into_inner();
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:8000/api/get_job")
        .json(&id)
        .send()
        .await
        .expect("error");

    if response.status().is_success() {
        let body = response.text().await.expect("error");

        let parsed_data: Job = serde_json::from_str(&body).expect("error parsing JSON");

        match render_edit_job_template(parsed_data) {
            Ok(rendered) => HttpResponse::Ok().body(rendered),
            Err(err) => {
                eprintln!("Error rendering template: {}", err);
                HttpResponse::InternalServerError().finish()
            }
        }
    } else {
        println!("Request failed with status code: {}", response.status());
        HttpResponse::InternalServerError().finish()
    }
}

fn render_edit_job_template(job: Job) -> Result<String, askama::Error> {
    let template = EditJobTemplate {
        title: "Edit Job".to_string(),
        job,
    };
    template.render()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(index)
            .service(get_jobs)
            .service(new_jobs_page)
            .service(add_job)
            .service(edit_job)
    })
    .bind(("127.0.0.1", 9999))?
    .run()
    .await
}
