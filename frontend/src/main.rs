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
    note: String,
    created_at: String,
}

#[function_component(App)]
fn app() -> Html {
    let jobs = use_state(|| Vec::new());

    {
        let jobs = jobs.clone();
        use_effect(move || {
            wasm_bindgen_futures::spawn_local(async move {
                let response = reqwest::get("https://localhost:8000/api/all_jobs")
                    .await.unwrap();
                let fetched_jobs: Vec<Job> = response.json().await.unwrap();
                jobs.set(fetched_jobs);
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
                    <th>{ "Note" }</th>
                    <th>{ "Created At" }</th>
                </tr>
                { jobs.iter().map(|job| html! {
                    <tr>
                        <td>{ &job.id }</td>
                        <td>{ &job.title }</td>
                        <td>{ &job.company }</td>
                        <td>{ &job.status }</td>
                        <td>{ &job.url }</td>
                        <td>{ &job.location }</td>
                        <td>{ &job.note }</td>
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
