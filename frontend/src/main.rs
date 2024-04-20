use yew::prelude::*;
use reqwasm::http::Request;


async fn fetch_data() -> String {
    let url = String::from("http://localhost:8000/api/");
    let response = Request::get(&url)
        .send()
        .await
        .unwrap();

    let data = response
        .json()
        .await
        .expect("Failed to parse JSON response");

    return data
}

#[function_component(UseEffect)]
fn effect() -> Html {
    let data = fetch_data();
    html! {
        <p>{data}</p>
    }
}

#[function_component(App)]
fn app() -> Html {
    html! {
        <h1>{ "Hello World" }</h1>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
