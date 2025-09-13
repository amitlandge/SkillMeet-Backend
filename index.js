import express from "express";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import bodyParser from "body-parser";
import userRoutes from "./Routes/userRoutes.js";
import { errorHandler } from "./Middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./Utils/corsOptions.js";
const app = express();
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();
connectDB()

app.use("/api/users", userRoutes);
app.use(errorHandler)
app.listen(process.env.PORT, () => {
  console.log("Server is running in port", process.env.PORT
  );
});
