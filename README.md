# ABOUT THIS APP

This is backend for contact list API system.

I have used Node.js, Express.js, PostgreSql, prisma, cloudinary ,multer and jest in this app.

# ROUTES

HOSTED DOMAIN 

https://contact-list-system.vercel.app

LOCAL DOMAIN

http://localhost:5000


ADD NEW CONTACT

HOSTNAME/api/v1/contacts  POST ROUTE (PUBLIC ROUTE)

GET ALL CONTACTS

HOSTNAME/api/v1/contacts  GET ROUTE (PUBLIC ROUTE)

GET SINGLE CONTACT BY ID

HOSTNAME/api/v1/contact/1  GET ROUTE (PUBLIC ROUTE)

SEARCH API

HOSTNAME/api/v1/contacts/search?query=nameORnumber  GET ROUTE (PUBLIC ROUTE)

UPDATE CONTACT BY ID

HOSTNAME/api/v1/contacts/1  PUT ROUTE (PUBLIC ROUTE)

DELETE CONTACT BY ID

HOSTNAME/api/v1/contacts/1  DELETE ROUTE (PUBLIC ROUTE)

EXPORT CONTACTS TO CSV

HOSTNAME/api/v1/contacts/export/contacts  GET ROUTE (PUBLIC ROUTE)


# TO RUN THIS PROJECT
### `clone the repo`
then
### `npm install`
then
### `add .env file in root directory. Variables are present in .env.local file`
then
### `npx prisma migrate dev --name init`
### `npx prisma generate`
then
### `npm run dev` 
Runs the app in the development mode.
### `npm start`
Runs the app in the production mode.
