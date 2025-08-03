"""
Application configuration
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    api_title: str = "QuantumDock API"
    api_description: str = "In-Silico DENV Drug Discovery Platform"
    api_version: str = "1.0.0"
    debug: bool = False
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    
    # File Storage
    upload_directory: str = "uploads"
    results_directory: str = "results"
    temp_directory: str = "temp"
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    
    # Docking Configuration
    max_concurrent_jobs: int = 5
    default_exhaustiveness: int = 8
    default_num_modes: int = 9
    default_energy_range: float = 3.0
    max_docking_time: int = 3600  # 1 hour in seconds
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: list = ["*"]
    allowed_methods: list = ["*"]
    allowed_headers: list = ["*"]
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "quantumdock.log"
    
    # Database (for future use)
    database_url: str = "sqlite:///./quantumdock.db"
    
    # External Tools (paths to molecular software)
    autodock_vina_path: str = "vina"
    openbabel_path: str = "obabel"
    pymol_path: str = "pymol"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def create_directories(self):
        """Create necessary directories"""
        Path(self.upload_directory).mkdir(exist_ok=True)
        Path(self.results_directory).mkdir(exist_ok=True)
        Path(self.temp_directory).mkdir(exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings"""
    settings = Settings()
    settings.create_directories()
    return settings
