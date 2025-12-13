import express from 'express'
import {
  configDotenv
} from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'
import {
  errorHandler
} from './src/middlewares/errorHandler.js'
import {
  connectToMongoDB
} from './src/configs/db.js'

//routes
import packageRouter from "./src/routes/package.routes.js"
import router from './src/routes/auth.js'
import userRouter from "./src/routes/user/user.js";
import activityRouter from "./src/routes/activity.routes.js"
import categoryRouter from "./src/routes/category.routes.js"
import destinationRouter from "./src/routes/destination.routes.js"
import vehicleRouter from "./src/routes/vehicle.routes.js"
import orderRouter from "./src/routes/order.routes.js"
import stripeWebhookRouter from "./src/routes/stripe_webhook.routes.js"
import { webhook_handler } from './src/controllers/order.controller.js'
import tagRouter from "./src/routes/tag.routes.js"
configDotenv()

const stripe_parser = bodyParser.raw({type:'application/json'})
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
    "https://malik-tours-frontend-qjnh.vercel.app"
  ] : [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://page-pop-frontend.vercel.app",
    "https://malik-tours-frontend-qjnh.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  credentials: true,
}))

// app.use(express.json())
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/stripe/webhook") {
    next()
  } else {
    express.json()(req, res, next)
  }
})

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
app.use(`/api/v1/activity`, activityRouter)
app.use(`/api`, router);
app.use(`/api/v1/user`, userRouter);
app.use(`/api/v1/category`,categoryRouter)
app.use(`/api/v1/destination`,destinationRouter)
app.use(`/api/v1/vehicle`,vehicleRouter)
app.use(`/api/v1/order`,orderRouter)
app.post(
  "/api/v1/stripe/webhook",
  bodyParser.raw({
    type: "application/json"
  }),
  webhook_handler
)
app.use(`/api/v1/tag/`,tagRouter)

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
  await connectToMongoDB()
  console.log(`Database connected and port running on:${process.env.PORT}`)
})
