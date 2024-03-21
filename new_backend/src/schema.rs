// @generated automatically by Diesel CLI.

diesel::table! {
    jobs (id) {
        id -> Varchar,
        status -> Varchar,
        title -> Varchar,
        company -> Varchar,
        url -> Varchar,
        location -> Varchar,
        date_submitted -> Timestamp,
        note -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}
