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

describe("Controlador de autenticación de usuarios", () => {
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

  describe("Registro", () => {
    it("Debería retornar 400 si la información requerida no está presente", async () => {
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Faltan datos" });
    });

    it("Debería retornar 400 si el usuario ya existe", async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(true);
      req.body = {
        email: "test@example.com",
        password: "password",
        nombre: "nombre",
        cedula: "1718137159",
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

    it("Debería retornar 200 y crear un usuario exitosamente", async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(null);
      (createUser as jest.Mock).mockResolvedValue({ id: "userId" });
      req.body = {
        email: "test@example.com",
        password: "password",
        nombre: "nombre",
        cedula: "1718137159",
        apellido: "apellido",
        direccion: "dir",
        telefono: "12345",
      };
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "userId" });
    });
  });

  describe("Inicio de sesión", () => {
    it("Debería retornar 400 si los datos requeridos no están presentes", async () => {
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Datos incorrectos" });
    });

    it("Debería retornar 400 si el usuario no se encuentra", async () => {
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

    it("Debería retornar 403 si la contraseña es incorrecta", async () => {
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

    it("Debería iniciar sesión correctamente y establecer la cookie de sesión", async () => {
      req.body = { email: "test@example.com", password: "correctpassword" };

      const mockUser = {
        _id: "userId",
        authentication: {
          salt: "salt",
          password: "hashedpassword",
          sessionToken: "session",
          isTemporaryPassword: false,
        },
        save: jest.fn().mockResolvedValue(true),
      };

      (getUserByEmail as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (authentication as jest.Mock)
        .mockImplementationOnce(() => "hashedpassword")
        .mockImplementationOnce(() => "sessionToken");

      await login(req, res);

      expect(mockUser.authentication.sessionToken).toBe("sessionToken");
      expect(res.cookie).toHaveBeenCalledWith("auth", "sessionToken");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("Debería responder con 403 si el usuario tiene una contraseña temporal", async () => {
      req.body = { email: "test@example.com", password: "correctpassword" };

      const mockUser = {
        _id: "userId",
        authentication: {
          salt: "salt",
          password: "hashedpassword",
          sessionToken: "session",
          isTemporaryPassword: true,
        },
        save: jest.fn().mockResolvedValue(true),
      };

      (getUserByEmail as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (authentication as jest.Mock)
        .mockImplementationOnce(() => "hashedpassword")
        .mockImplementationOnce(() => "sessionToken");

      await login(req, res);

      expect(mockUser.authentication.sessionToken).toBe("sessionToken");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("Recuperación de contraseña", () => {
    it("Debería retornar 400 si falta el email", async () => {
      await requestPasswordReset(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Falta el email" });
    });

    it("Debería retornar 404 si el usuario no se encuentra", async () => {
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

    it("Debería enviar un correo de recuperación de contraseña exitosamente", async () => {
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

  describe("Cambio de contraseña", () => {
    it("Debería retornar 400 si falta la nueva contraseña", async () => {
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Se requiere una nueva contraseña",
      });
    });

    it("Debería cambiar la contraseña exitosamente", async () => {
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

  describe("Cerrar sesión", () => {
    it("Debería borrar el cookie de autenticación y retornar 200", async () => {
      await logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("auth");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Sesión cerrada" });
    });
  });
});
