# File Uploader and Manager with Google Drive Integration

This project provides an API for uploading files to Google Drive and retrieving a list of uploaded files with their corresponding Google Drive links. The solution is built using **NestJS** and designed for scalability and reliability.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup](#setup)
4. [Endpoints](#endpoints)
5. [Migrations](#migrations)
6. [Running the Project](#running-the-project)
7. [Testing and Improvements](#testing-and-improvements)

---

## Overview

This project is designed to:

- Accept file URLs via API and upload them to Google Drive.
- Retrieve a list of uploaded files with metadata and downloadable links.

---

## Features

1. Upload files to Google Drive from provided URLs.
2. Retrieve a list of files with metadata such as size, type, and upload time.
3. Supports large file uploads efficiently.
4. Dockerized setup for seamless deployment.
5. Supports PostgreSQL or MySQL for database storage.

---

## Setup

1. **Prepare Google Drive**:
   - Create a folder in Google Drive.
   - Add permissions for the service account to the folder.
   - Retrieve the folder ID and add it to `.env` as `GOOGLE_DRIVE_FOLDER_ID`.

2. **Database Configuration**:
   - Choose PostgreSQL or MySQL.
   - Update the `DATABASE_URL` in `.env` accordingly.

3. **Environment Variables**:
   - Use `.${NODE_ENV}.env` naming convention to handle different environments (e.g., `.development.env`, `.production.env`).

4. **Docker**:
   - Ensure Docker and Docker Compose are installed on your system.

---

## Endpoints

### 1. Get Files List

**Endpoint**: `{{address}}/files`  
**Method**: `GET`  
**Description**: Retrieves a list of uploaded files with metadata.

**Response Example**:
```json
[
  {
    "id": 2,
    "name": "kali-linux-2024.4-installer-amd64.iso",
    "link": "https://drive.google.com/uc?export=download&id=аааааааааааа",
    "size": "4.07 GB",
    "mimeType": "binary/octet-stream",
    "createdAt": "2025-01-11T08:01:03.143Z",
    "updatedAt": "2025-01-11T08:01:03.143Z"
  }
]
```

### 2. Upload Files

**Endpoint**: `{{address}}/files`  
**Method**: `POST`  
**Description**: Uploads files to Google Drive based on the provided URLs.

**Request Body**:
```json
{
  "urls": [
    "https://github.com/nestjs/graphql/archive/refs/heads/master.zip",
    "https://github.com/typeorm/typeorm/archive/refs/heads/master.zip"
  ]
}
```

**Response Example**:
```json
[
  {
    "id": 4,
    "name": "master.zip",
    "link": "https://drive.google.com/uc?export=download&id=аааааааааааа",
    "size": "100.00 КB",
    "mimeType": "application/zip",
    "createdAt": "2025-01-11T08:37:46.652Z",
    "updatedAt": "2025-01-11T08:37:46.652Z"
  }
]
```

---

## Migrations

Manage database migrations with the following commands:

1. **Generate Migration** (based on models):
   ```bash
   npm run migration:generate --filename=<migration_name>
   ```

2. **Create Empty Migration**:
   ```bash
   npm run migration:create --filename=<migration_name>
   ```

3. **Run Migrations**:
   ```bash
   npm run migration:run
   ```

4. **Run Migrations (Fake)**:
   ```bash
   npm run migration:run:fake
   ```

5. **Revert Last Migration**:
   ```bash
   npm run migration:revert
   ```

---

## Running the Project

1. **Build Docker Images**:
   ```bash
   docker-compose build
   ```

2. **Start the Application**:
   ```bash
   docker-compose up
   ```

3. **Access the Application**:
   Visit `http://localhost:<PORT>` (as specified in `docker-compose.yml`).

4. **Stop the Application**:
   ```bash
   docker-compose down
   ```

---

## Testing and Improvements

### Testing Notes

The application was tested with the following files:

- **ISO File**: Successfully uploaded a file of size 4 GB.
- **MP4 File**: Successfully uploaded a file of size 655 MB.

### Potential Improvements

1. **Test Coverage**:
   - Add unit and integration tests to ensure reliability and maintainability.

2. **Swagger Documentation**:
   - Implement Swagger for better API documentation and ease of use.


4. **Error Handling**:
   - Enhance error reporting for edge cases and API failures.
