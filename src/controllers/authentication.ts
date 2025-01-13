import express from "express";
import { authentication, random } from "../helpers/password";
import { getUserByEmail, createUser, getUserById, getUserByCedula } from "../db/usersBd";
import { generateTemporaryPassword } from "../helpers/temporaryPassword";
import { sendEmail } from "../helpers/mailer";
import { get } from "lodash";
import { validateID } from "../helpers/validateID";

export const storeVerificationCode = (res: express.Response, email: string, code: string) => {
  const cookieName = `verificationCode`;
  const cookieValue = code;
  const isProduction = process.env.PROD === "production";
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? ("none" as const) : ("strict" as const),
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie(cookieName, cookieValue, cookieOptions);
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { cedula, nombre, apellido, direccion, telefono, email, password } = req.body;
    if (!nombre || !email || !password || !cedula || !apellido || !direccion || !telefono) {
      res.status(401).json({ message: "Faltan datos" });
      return;
    }

    if (!validateID(cedula)) {
      res.status(402).json({ message: "El cedula no es válida" });
      return;
    }

    const existingUser = await getUserByEmail(email);
    const existingUserByCedula = await getUserByCedula(cedula);

    if (existingUser || existingUserByCedula) {
      res.status(400).json({ message: "El usuario ya existe" });
      return;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sendEmail(email, `Código verificación`, `Tu código de verificación temporal es: ${verificationCode}`);

    storeVerificationCode(res, email, verificationCode);

    res.status(200).json({ message: "Código de verificación enviado" });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error al crear el usuario" });
    return;
  }
};

export const verifyEmailAndCreateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { cedula, nombre, apellido, direccion, telefono, email, password, verificationCode } = req.body;

    const storedCode = req.cookies[`verificationCode`];

    if (!storedCode || storedCode !== verificationCode) {
      res.status(403).json({ message: "Código de verificación inválido o expirado" });
      return;
    }

    const salt = random();
    const user = await createUser({
      cedula,
      nombre,
      apellido,
      direccion,
      telefono,
      email,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al verificar y crear el usuario" });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Datos incorrectos" });
      return;
    }

    const user = await getUserByEmail(email).select("+authentication.salt +authentication.password +authentication.isTemporaryPassword");

    if (!user) {
      res.status(400).json({ message: "Usuario no encontrado" });
      return;
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      res.status(403).json({ message: "Contraseña incorrecta" });
      return;
    }

    const salt = random();

    user.authentication.sessionToken = authentication(salt, user._id.toString());

    await user.save();

    const isProduction = process.env.PROD === "production";
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProduction? "none" as const: "strict" as const,
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("auth", user.authentication.sessionToken, cookieOptions);

    if (user.authentication.isTemporaryPassword) {
      console.log("Debes cambiar tu contraseña temporal");
      res.status(403).json(user);
    } else {
      res.status(200).json(user);
    }

    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error al iniciar sesión" });
    return;
  }
};

export const requestPasswordReset = async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Falta el email" });
      return;
    }

    const user = await getUserByEmail(email).select("+authentication.password +authentication.salt");

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const temporaryPassword = generateTemporaryPassword();
    const newSalt = random();

    user.authentication.password = authentication(newSalt, temporaryPassword);
    user.authentication.salt = newSalt;
    user.authentication.isTemporaryPassword = true;
    await user.save();

    await sendEmail(user.email, "Restablecimiento de contraseña", `Tu contraseña temporal es: ${temporaryPassword}`);

    res.status(200).json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error al intentar restablecer la contraseña" });
    return;
  }
};

export const changePassword = async (req: express.Request, res: express.Response) => {
  try {
    const { newPassword } = req.body;
    const userId = get(req, "identity._id");

    if (!newPassword) {
      res.status(400).json({ message: "Se requiere una nueva contraseña" });
      return;
    }

    const user = await getUserById(userId);
    const newSalt = random();

    user.authentication.password = authentication(newSalt, newPassword);
    user.authentication.salt = newSalt;
    user.authentication.isTemporaryPassword = false;
    await user.save();

    res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error al cambiar la contraseña" });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    res.clearCookie("auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none" as const,
    });
    res.status(200).json({ message: "Sesión cerrada" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error al cerrar la sesión" });
  }
};
