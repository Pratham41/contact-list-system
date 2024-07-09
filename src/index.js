const app = require("./app");
const client = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT;

client
  .$connect()
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting to the database: ${err.message}`);
    process.exit(1);
  });
