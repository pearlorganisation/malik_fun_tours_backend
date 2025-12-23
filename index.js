import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { connectToMongoDB } from "./src/configs/db.js";

//routes
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import activityRouter from "./src/routes/activity.routes.js";
import bookingRouter from "./src/routes/booking.routes.js";
configDotenv();

const stripe_parser = bodyParser.raw({ type: "application/json" });
const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? [
            "http://localhost:4000",
            "http://localhost:4002",
            "http://localhost:4003",
            "http://localhost:3000",
            "http://localhost:3001",
            "https://malik-frontend-jhf8.vercel.app",
            "https://malik-admin-panel.vercel.app/",
          ]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://malik-frontend-jhf8.vercel.app",
            "https://malik-admin-panel.vercel.app/",
          ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.set("view engine", "ejs");

app.use(`/health`, async (req, res) => {
  res.status(200).json({
    message: "Server is running well",
    success: true,
  });
});

/** declare our routes */

app.use(`/api/v1/activity`, activityRouter);
app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/user`, userRouter);
app.use(`/api/v1/bookings`, bookingRouter);

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
  await connectToMongoDB();
  console.log(`Database connected and port running on:${process.env.PORT}`);
});
