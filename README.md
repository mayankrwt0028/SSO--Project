# SSO Authentication Project

A full-stack authentication project with manual login/signup and Google & GitHub SSO.

## Features

* Manual Signup & Login
* Google SSO
* GitHub SSO
* JWT authentication using HTTP-only cookies
* Duplicate email handling
* Protected Users page
* Logout
* PostgreSQL database with Prisma
* Responsive UI

## Tech Stack

* React + TypeScript
* Node.js + Express
* PostgreSQL (Neon)
* Prisma
* JWT
* OAuth 2.0

## How to Run

-----Install dependencies:----


npm install


-----Backend-----

Go to the server folder:

cd server

Install dependencies:

npm install

Create your environment file:

cp .env.example .env

Add your database and OAuth credentials to .env.

Generate Prisma Client:

npx prisma generate

Apply database migrations:

npx prisma migrate deploy

Start the backend:

npm run dev



---frontend----


npm run dev


Make sure your `.env` contains the required database, JWT, Google OAuth, and GitHub OAuth credentials.


