//CONFIGURACION DEL SERVIDOR EXPRESS
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
    credentials: true,
    }));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);


server.listen(8080, () => {                                                                     //ESTA FUNCION ES PARA QUE EL PUERTO 8080 
    console.log('La aplicacion esta corriendo en http://localhost:8080');
    });

const  Mongo_URL = 'mongodb+srv://hamilton:hamilton@cluster0.6pcjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.Promise = Promise;
mongoose.connect(Mongo_URL);
mongoose.connection.on( 'error', (error: Error) => console.log(error));