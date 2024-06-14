use yew::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Job {
    id: String,
    title: String,
    company: String,
    status: String,
    url: String,
    location: String,
    note: Option<String>,
    created_at: String,
}

#[function_component(App)]
fn app() -> Html {
    let jobs_state = use_state(|| Vec::new());

    {
        let jobs_state = jobs_state.clone();
        use_effect(move || {
            wasm_bindgen_futures::spawn_local(async move {
                let response = reqwest::get("http://localhost:8000/api/all_jobs").await;

                match response {
                    Ok(response) => {
                        let fetched_jobs: Result<Vec<Job>, _> = response.json().await;

                        match fetched_jobs {
                            Ok(jobs) => jobs_state.set(jobs),
                            Err(err) => {
                                let error_message = format!("Error fetching jobs: {}", err);
                                println!("{}", error_message);
                            }
                        }
                    }
                    Err(err) => {
                        let error_message = format!("Error fetching jobs: {}", err);
                        println!("{}", error_message);
                    }
                }
            });
            || ()
        });
    }

    html! {
        <div>
            <h1>{ "Hello, Yew!" }</h1>
            <table>
                <tr>
                    <th>{ "ID" }</th>
                    <th>{ "Title" }</th>
                    <th>{ "Company" }</th>
                    <th>{ "Status" }</th>
                    <th>{ "URL" }</th>
                    <th>{ "Location" }</th>
                    <th>{ "Created At" }</th>
                </tr>
                { jobs_state.iter().map(|job| html! {
                    <tr>
                        <td>{ &job.id }</td>
                        <td>{ &job.title }</td>
                        <td>{ &job.company }</td>
                        <td>{ &job.status }</td>
                        <td>{ &job.url }</td>
                        <td>{ &job.location }</td>
                        <td>{ &job.created_at }</td>
                    </tr>
                }).collect::<Html>() }
            </table>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
