import {
  register,
  login,
  requestPasswordReset,
  changePassword,
  logout,
} from "../controllers/authentication";
import { getUserByEmail, createUser, getUserById } from "../db/usersBd";
import { authentication, random } from "../helpers/password";
import { generateTemporaryPassword } from "../helpers/temporaryPassword";
import { sendEmail } from "../helpers/mailer";

jest.mock("../db/usersBd");
jest.mock("../helpers/password");
jest.mock("../helpers/temporaryPassword");
jest.mock("../helpers/mailer");

describe("User Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should return 401 if required data is missing", async () => {
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Faltan datos" });
    });

    it("should return 400 if user already exists", async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(true);
      req.body = {
        email: "test@example.com",
        password: "password",
        nombre: "nombre",
        cedula: "123",
        apellido: "apellido",
        direccion: "dir",
        telefono: "12345",
      };
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El usuario ya existe",
      });
    });

    it("should return 200 and create a user successfully", async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(null);
      (createUser as jest.Mock).mockResolvedValue({ id: "userId" });
      req.body = {
        email: "test@example.com",
        password: "password",
        nombre: "nombre",
        cedula: "123",
        apellido: "apellido",
        direccion: "dir",
        telefono: "12345",
      };
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "userId" });
    });
  });

  describe("login", () => {
    it("should return 400 if required data is missing", async () => {
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Datos incorrectos" });
    });

    it("should return 400 if user is not found", async () => {
      (getUserByEmail as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      req.body = { email: "test@example.com", password: "password" };
      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado",
      });
    });

    it("should return 403 if password is incorrect", async () => {
      (getUserByEmail as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          authentication: { salt: "salt", password: "wrongHash" },
        }),
      });

      req.body = { email: "test@gmail.com", password: "password" };

      (authentication as jest.Mock).mockReturnValue("correctHash");

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contraseña incorrecta",
      });
    });
  });

  describe("requestPasswordReset", () => {
    it("should return 400 if email is missing", async () => {
      await requestPasswordReset(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Falta el email" });
    });

    it("should return 404 if user is not found", async () => {
      (getUserByEmail as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      req.body = { email: "test@example.com" };

      await requestPasswordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado",
      });
    });

    it("should send a password reset email successfully", async () => {
      (getUserByEmail as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          email: "test@example.com",
          authentication: {
            password: "oldPassword",
            salt: "oldSalt",
            isTemporaryPassword: false,
          },
          save: jest.fn().mockResolvedValue(true),
        }),
      });

      (generateTemporaryPassword as jest.Mock).mockReturnValue("tempPassword");
      (random as jest.Mock).mockReturnValue("newSalt");
      (sendEmail as jest.Mock).mockResolvedValue(null);

      req.body = { email: "test@example.com" };

      await requestPasswordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Correo de recuperación enviado",
      });
      expect(sendEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Restablecimiento de contraseña",
        "Tu contraseña temporal es: tempPassword"
      );
    });
  });

  describe("changePassword", () => {
    it("should return 400 if new password is missing", async () => {
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Se requiere una nueva contraseña",
      });
    });

    it("should change the password successfully", async () => {
      req.body = { newPassword: "newPassword" };
      req.identity = { _id: "userId" };

      (getUserById as jest.Mock).mockResolvedValue({
        authentication: {
          password: "oldHash",
          salt: "oldSalt",
          isTemporaryPassword: true,
        },
        save: jest.fn().mockResolvedValue(true),
      });

      (random as jest.Mock).mockReturnValue("newSalt");
      (authentication as jest.Mock).mockReturnValue("newHash");

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contraseña cambiada exitosamente",
      });
      expect(getUserById).toHaveBeenCalledWith("userId");
    });
  });

  describe("logout", () => {
    it("should clear the auth cookie and return 200", async () => {
      await logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("auth");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Sesión cerrada" });
    });
  });
});
