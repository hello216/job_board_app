use yew::prelude::*;

#[function_component]
fn App() -> Html {
    let counter = use_state(|| 0);
    let onclick = {
        let counter = counter.clone();
        move |_| {
            let value = *counter + 1;
            counter.set(value);
        }
    };

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
                { for job in jobs.iter() => {
                    <tr>
                        <td>{ job.id }</td>
                        <td>{ job.title }</td>
                        <td>{ job.company }</td>
                        <td>{ job.status }</td>
                        <td>{ job.url }</td>
                        <td>{ job.location }</td>
                        <td>{ job.note }</td>
                        <td>{ job.created_at }</td>
                    </tr>
                }
            </table>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
