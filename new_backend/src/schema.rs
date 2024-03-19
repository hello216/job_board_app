// @generated automatically by Diesel CLI.

diesel::table! {
    jobs (id) {
        id -> Int4,
        status -> Varchar,
        title -> Varchar,
        company -> Varchar,
        url -> Varchar,
        location -> Varchar,
        date_submitted -> Varchar,
        note -> Varchar,
        created_at -> Varchar,
        updated_at -> Varchar,
    }
}
