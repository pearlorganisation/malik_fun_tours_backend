import express from 'express'
import {
  configDotenv
} from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import {
  errorHandler
} from './src/middlewares/errorHandler.js'
import {
  connectToMongoDB
} from './src/configs/db.js'
import packageRouter from "./src/routes/package.routes.js"
import router from './src/routes/user.js'
configDotenv()

const app = express()

app.use(cors({
  origin: process.env.NODE_ENV === "development" ? [
    "http://localhost:4000",
    "http://localhost:4002",
    "http://localhost:4003",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://page-pop-frontend.vercel.app",
  ] : [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://page-pop-frontend.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(cookieParser())
app.use(morgan("dev"))
app.set("view engine", "ejs")

app.use(`/health`, async (req, res) => {
  res.status(200).json({
    message: "Server is running well",
    success: true
  });
})

/** declare our routes */


app.use(`/api/v1/package`, packageRouter)
app.use(`/api`, router);




/** */

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
  await connectToMongoDB()
  console.log(`Database connected and port running on:${process.env.PORT}`)
})