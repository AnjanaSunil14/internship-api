# Internship REST API

A Node.js and Express REST API for managing internship records with SQLite persistence, pagination, and input validation. Built as part of the Full Stack Development track.

## Features
- **Persistent Storage:** SQLite database (`database.sqlite`) with automated record seeding.
- **Full CRUD Support:** Endpoints to list, view details, create, update, and delete internship records.
- **Pagination:** Query parameters (`?page=1&limit=5`) for navigating large datasets.
- **Validation:** Input validation ensuring required fields are present with correct status codes.

## Prerequisites
- Node.js installed on your machine.

## Getting Started

1. Clone the repository:
   ```bash
   git clone <your-github-repository-url>
   cd internship-api