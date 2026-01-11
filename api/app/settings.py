from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "local"

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "metricops"
    DB_USER: str = "metricops"
    DB_PASSWORD: str = "metricops_pw"

    # Comma-separated list in .env, parsed into list below
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def db_dsn(self) -> str:
        # psycopg3 DSN format
        return (
            f"host={self.DB_HOST} port={self.DB_PORT} dbname={self.DB_NAME} "
            f"user={self.DB_USER} password={self.DB_PASSWORD}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()
