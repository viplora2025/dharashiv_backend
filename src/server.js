import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config(); // ✅ sabse pehle

import app from "./app.js";
import connectDB from "./config/db_config.js";

connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



// step 1: npm install express mongoose cors dotenv jsonwebtoken bcryptjs swagger-jsdoc swagger-ui-express
// step 2: npm install --save-dev nodemon
// step 3: create .env file sended on whatsapp
// step 4: npm run dev for starting server in dev mode or npm start for production mode
// step 5: API docs available at http://localhost:4000/api-docs or use Postman for testing APIs

