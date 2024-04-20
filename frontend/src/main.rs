use yew::prelude::*;
use reqwasm::http::Request;


async fn fetch_data() -> String {
    let url = String::from("http://localhost:1234/api/");
    let response = Request::get(&url)
        .send()
        .await
        .unwrap();

    let data = response
        .json()
        .await
        .expect("Failed to parse JSON response");

    data
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
