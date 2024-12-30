import express, { application } from "express";
import dotenv from "dotenv";
import https from "https";
import { createRental, RentalModel } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";
import { updateRental } from "./rentals";

dotenv.config();

const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalApiUrl = process.env.PAYPAL_API_URL || "";

const getAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64");

  const options = {
    method: "POST",
    hostname: new URL(paypalApiUrl).hostname,
    path: "/v1/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const response = JSON.parse(data);
        if (response.access_token) {
          resolve(response.access_token);
        } else {
          reject("No se pudo obtener el token de acceso");
        }
      });
    });

    req.on("error", (err) => {
      reject(`Error en la solicitud de token: ${err.message}`);
    });

    req.write("grant_type=client_credentials");
    req.end();
  });
};

let rentalDataTemp: any = {};

export const createPayment = async (total: number, currency: string, description: string, rentalData: any) => {
  try {
    const accessToken = await getAccessToken();

    const paymentBody = JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            value: total,
            currency_code: currency,
          },
          description,
        },
      ],
      application_context: {
        brand_name: "Flexi Drive",
        user_action: "PAY_NOW",
        return_url: `${process.env.HOST}/payments/capture`,
        cancel_url: `${process.env.HOST}/payments/cancel`,
      },
    });

    const options = {
      method: "POST",
      hostname: new URL(paypalApiUrl).hostname,
      path: "/v2/checkout/orders",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const paymentResponse = await makeHttpRequest(options, paymentBody);

    rentalDataTemp = rentalData;

    return paymentResponse;
  } catch (error) {
    console.error("Error al crear el pago:", error);
    return;
  }
};

export const capturePayment = async (req: express.Request, res: express.Response) => {
  const { token } = req.query;

  try {
    const accessToken = await getAccessToken();

    const options = {
      method: "POST",
      hostname: new URL(paypalApiUrl).hostname,
      path: `/v2/checkout/orders/${token}/capture`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const captureResponse = await makeHttpRequest(options);

    if (captureResponse.status !== "COMPLETED") {
      res.status(500).json({ message: "Error en el pago" });
      return;
    }

    // Desde el empleado
    if (rentalDataTemp.estado === "En curso") {
      const newRental = await createRental(rentalDataTemp);
      const autoData = await CarModel.findById(rentalDataTemp.auto);
      autoData.estado = "Alquilado";
      await autoData.save();
      console.log("Redireccionar a rentas");
      
    }

    // Desde el cliente
    if (rentalDataTemp._id) {
      const rentalData = await RentalModel.findById(rentalDataTemp._id);
      rentalData.estado = "En curso";
      await rentalData.save();
      const autoData = await CarModel.findById(rentalDataTemp.auto);
      autoData.estado = "Alquilado";
      await autoData.save();
      console.log("Redireccionar a rentas de cliente");
    }

    //Para devolución del auto
    if (rentalDataTemp.idDevolucion) {
      const rentalData = await RentalModel.findById(rentalDataTemp.idDevolucion);
      const autoData = await CarModel.findById(rentalData.auto);

      rentalData.set("piezasRevisadas", rentalDataTemp.piezasRevisadas);
      rentalData.fechaDevolucion = rentalDataTemp.fechaDevolucion;
      rentalData.penalizacionPorDanios = rentalDataTemp.valorDanios;
      rentalData.penalizacionPorDias = rentalDataTemp.valorDias;
      rentalData.estado = "Finalizado";
      rentalData.total = rentalDataTemp.total;
      autoData.estado = "Disponible";

      await rentalData.save();
      await autoData.save();
    }

    res.status(200).json({ message: "Pago capturado y devolución finalizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al capturar el pago", error });
  }
};

const makeHttpRequest = (options: https.RequestOptions, body?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (err) {
          reject(`Error al parsear la respuesta: ${err}`);
        }
      });
    });

    req.on("error", (err) => {
      reject(`Error en la solicitud HTTP: ${err.message}`);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
};

export const cancelPayment = async (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Pago cancelado" });
  // res.redirect("/");
};
