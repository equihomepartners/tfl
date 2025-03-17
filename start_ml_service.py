#!/usr/bin/env python3
import os
import sys
import uvicorn

if __name__ == "__main__":
    # Add the project root to Python path
    project_root = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, project_root)
    
    # Print debug information
    print(f"Project root: {project_root}")
    print(f"Python path: {sys.path}")
    print(f"Current working directory: {os.getcwd()}")
    
    # Start the service
    uvicorn.run("src.ml.api:app", host="0.0.0.0", port=8000, reload=True) 