export interface IAppConfig {
  email_password_login: boolean;
  file_size_limit: number;
  github_app_name: string | null;
  github_client_id: string | null;
  google_client_id: string | null;
  has_openai_configured: boolean;
  has_unsplash_configured: boolean;
  is_smtp_configured: boolean;
  oidc_auto: boolean;
  oidc_client_id: string | null;
  oidc_url_authorize: string | null;
  oidc_url_endsession: string | null;
  magic_login: boolean;
  posthog_api_key: string | null;
  posthog_host: string | null;
  slack_client_id: string | null;
}
