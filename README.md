# Category Management API

A REST API for managing hierarchical categories using NestJS and Prisma.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your PostgreSQL database and update the `.env` file with your database URL
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `npm run start:dev`

## API Endpoints

### Create a category
- **POST** `/categories`
- Body:
  ```json
  {
    "name": "Category Name",
    "parentId": 1  // Optional, ID of parent category
  }
  ```

### Get a subtree
- **GET** `/categories/:id`

### Remove a category
- **DELETE** `/categories/:id`

### Move a category to another parent
- **PATCH** `/categories/:id/move`
- Body:
  ```json
  {
    "targetParentId": 2  // ID of the new parent category
  }
  ```

## Running Tests

- Run tests: `npm test`
- Run tests with coverage: `npm run test:cov`

## API Documentation

Swagger documentation is available at `http://localhost:3000/api` when the server is running.