//CONFIGURACION DEL SERVIDOR EXPRESS
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./router";

dotenv.config();

const app = express();
const port = process.env.PORT;
const mongoUrl = process.env.URL_MONGODB;

const allowedOrigins = ["https://frontgestion.vercel.app", "https://frontgestion-628ylkl4l-sharpblades-projects.vercel.app", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`La aplicacion esta corriendo en http://localhost:${port}`);
});

if (!mongoUrl) {
  console.log("No se ha especificado la URL de MongoDB");
  process.exit(1);
}

mongoose.Promise = Promise;
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error: Error) => {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  });

app.use("/", router());

export default app;
