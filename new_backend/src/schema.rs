// @generated automatically by Diesel CLI.

diesel::table! {
    jobs (id) {
        id -> Varchar,
        status -> Varchar,
        title -> Varchar,
        company -> Varchar,
        url -> Varchar,
        location -> Varchar,
        note -> Nullable<Varchar>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}
