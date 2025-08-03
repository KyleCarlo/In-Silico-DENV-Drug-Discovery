# QuantumDock Backend

FastAPI backend for the In-Silico DENV Drug Discovery platform, providing protein-ligand interaction analysis and molecular docking capabilities.

## Features

- **Protein Management**: Upload, analyze, and manage protein structures (PDB format)
- **Ligand Management**: Create ligands from SMILES, upload structure files, calculate molecular properties
- **Molecular Docking**: Perform protein-ligand docking simulations with customizable parameters
- **Analysis Tools**: Structure analysis, binding site prediction, drug-likeness assessment
- **RESTful API**: Comprehensive REST API with OpenAPI/Swagger documentation
- **Background Processing**: Asynchronous job processing for long-running calculations

## Project Structure

```
be/
├── main.py              # FastAPI application entry point
├── run_server.py        # Server startup script
├── pyproject.toml       # Project dependencies
├── .env.example         # Environment variables template
├── api/                 # API route handlers
│   ├── proteins.py      # Protein management endpoints
│   ├── ligands.py       # Ligand management endpoints
│   └── docking.py       # Molecular docking endpoints
├── models/              # Data models
│   └── database.py      # Pydantic models
├── utils/               # Utility functions
│   ├── molecular.py     # Molecular analysis utilities
│   └── docking.py       # Docking simulation utilities
└── core/                # Core configuration
    └── config.py        # Application settings
```

## Installation

### Prerequisites

- Python 3.12+
- UV package manager (or pip)

### Setup

1. **Install dependencies:**
   ```cmd
   uv sync
   ```

2. **Set up environment variables:**
   ```cmd
   copy .env.example .env
   ```
   Edit `.env` file with your configuration.

3. **Run the server:**
   ```cmd
   python run_server.py
   ```

   Or using uvicorn directly:
   ```cmd
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once the server is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Core Endpoints

- `GET /` - API information
- `GET /health` - Health check

### Protein Management

- `POST /proteins/` - Create protein entry
- `POST /proteins/upload/` - Upload PDB file
- `GET /proteins/` - List all proteins
- `GET /proteins/{id}` - Get protein details
- `GET /proteins/{id}/analyze` - Analyze protein structure
- `GET /proteins/{id}/download` - Download PDB file

### Ligand Management

- `POST /ligands/` - Create ligand entry
- `POST /ligands/from-smiles/` - Create ligand from SMILES
- `POST /ligands/upload/` - Upload ligand structure
- `GET /ligands/` - List all ligands
- `GET /ligands/{id}` - Get ligand details
- `GET /ligands/{id}/analyze` - Analyze ligand properties
- `GET /ligands/{id}/image` - Generate 2D structure image

### Molecular Docking

- `POST /docking/jobs/` - Create docking job
- `GET /docking/jobs/` - List docking jobs
- `GET /docking/jobs/{id}` - Get job status and results
- `PUT /docking/jobs/{id}/cancel` - Cancel running job
- `DELETE /docking/jobs/{id}` - Delete job
- `GET /docking/jobs/{id}/results` - Get detailed results
- `GET /docking/jobs/{id}/download/{type}` - Download result files

## Example Usage

### 1. Create a ligand from SMILES

```bash
curl -X POST "http://localhost:8000/ligands/from-smiles/" \
  -H "Content-Type: application/json" \
  -d '{
    "smiles": "CCOc1ccc2c(c1)sc(n2)NC(=O)c3c(cnc(n3)SC)Br",
    "name": "Lead Compound"
  }'
```

### 2. Upload protein structure

```bash
curl -X POST "http://localhost:8000/proteins/upload/" \
  -F "file=@protein.pdb" \
  -F "name=DENV NS3 Helicase"
```

### 3. Start docking job

```bash
curl -X POST "http://localhost:8000/docking/jobs/" \
  -H "Content-Type: application/json" \
  -d '{
    "protein_id": "protein_abc123",
    "ligand_id": "ligand_xyz789",
    "parameters": {
      "center_x": 10.0,
      "center_y": 20.0,
      "center_z": 30.0,
      "size_x": 25.0,
      "size_y": 25.0,
      "size_z": 25.0,
      "exhaustiveness": 8,
      "num_modes": 9
    }
  }'
```

## Default Data

The API comes with pre-loaded data for DENV research:

- **Default Protein**: DENV2 NS3 Helicase (PDB: 2BMF)
- **Default Ligand**: Lead compound from research (SMILES: `CCOc1ccc2c(c1)sc(n2)NC(=O)c3c(cnc(n3)SC)Br`)

## Configuration

Key configuration options in `.env`:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true

# File storage
UPLOAD_DIRECTORY=uploads
RESULTS_DIRECTORY=results
MAX_FILE_SIZE=104857600

# Docking
MAX_CONCURRENT_JOBS=5
DEFAULT_EXHAUSTIVENESS=8
DEFAULT_NUM_MODES=9

# CORS (for frontend integration)
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

## Development

### Running in Development Mode

```cmd
python run_server.py
```

This starts the server with auto-reload enabled for development.

### Testing

The API includes comprehensive error handling and validation. Test the endpoints using:

- Interactive docs at `/docs`
- HTTP client tools (curl, Postman, etc.)
- Frontend application integration

## Dependencies

Key dependencies include:

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **RDKit**: Chemical informatics (optional)
- **BioPython**: Biological data processing (optional)
- **NumPy**: Numerical computing
- **aiofiles**: Async file operations

## Molecular Software Integration

The backend is designed to integrate with molecular modeling software:

- **AutoDock Vina**: Molecular docking
- **Open Babel**: Chemical format conversion
- **PyMOL**: Molecular visualization
- **RDKit**: Chemical property calculation

## Future Enhancements

- Database integration (SQLite/PostgreSQL)
- User authentication and authorization
- Real molecular docking integration
- Advanced analysis algorithms
- Workflow management
- Results visualization
- Performance optimization

## License

This project is part of the In-Silico DENV Drug Discovery platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the project repository.
