use yew::prelude::*;

fn fetch_data() -> String {
    let url = String::from("http://localhost:8000/api/");
    let response = fetch::fetch_body(url);

    let data = response
        .json().expect("Failed to parse JSON response");

    return data
}

// #[function_component(UseEffect)]
// fn effect() -> Html {
//     let data = fetch_data();
//     html! {
//         <p>{data}</p>
//     }
// }

#[function_component(App)]
fn app() -> Html {
    html! {
        <div>
            <h1>{ "Hello World" }</h1>
            <button onclick={fetch_data}>{"Fetch Data"}</button>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
