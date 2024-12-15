import express from "express";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalApiUrl = process.env.PAYPAL_API_URL || "";

// Método para obtener el token de acceso
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

// Crear un nuevo pago
export const createPayment = async (req: express.Request, res: express.Response) => {
  const { total, currency, description } = req.body;

  if (!total || !currency || !description) {
    res.status(400).json({ message: "Faltan parámetros obligatorios" });
    return;
  }

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

    res.status(200).json(paymentResponse);
  } catch (error) {
    console.error("Error al crear el pago:", error);
    res.status(500).json({ message: "Error al crear el pago", error });
  }
};

// Capturar un pago
export const capturePayment = async (req: express.Request, res: express.Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    res.status(400).json({ message: "El ID del pedido es obligatorio" });
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const options = {
      method: "POST",
      hostname: new URL(paypalApiUrl).hostname,
      path: `/v2/checkout/orders/${orderId}/capture`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const captureResponse = await makeHttpRequest(options);

    res.status(200).json(captureResponse);
  } catch (error) {
    console.error("Error al capturar el pago:", error);
    res.status(500).json({ message: "Error al capturar el pago", error });
  }
};

// Función auxiliar para realizar solicitudes HTTP
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
