// @generated automatically by Diesel CLI.

diesel::table! {
    jobs (id) {
        id -> Int4,
        status -> Varchar,
        title -> Varchar,
        company -> Nullable<Varchar>,
        url -> Varchar,
        location -> Nullable<Varchar>,
        date_submitted -> Varchar,
        note -> Nullable<Varchar>,
        created_at -> Varchar,
        updated_at -> Varchar,
    }
}
