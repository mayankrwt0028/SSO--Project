import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import googleRoutes from './routes/google.routes'
import githubRoutes from "./routes/github.routes.js";
import adminRoutes from "./routes/admin.routes"

import { prisma } from "../lib/prisma";


const app = express();
const PORT = 3000

app.use(cors({
  origin: "http://localhost:5173",
  credentials:true,
}))
app.use(express.json())
app.use(cookieParser())

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/auth/google", googleRoutes)
app.use("/auth/github", githubRoutes)
app.use("/admin", adminRoutes)

app.get("/",(req,res)=>{
  res.json({
    message: "SSO server is running"
  })
})



app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`)
})