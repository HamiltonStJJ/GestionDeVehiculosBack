import request from "supertest";
import app from "../index";
import { getUserById, deleteUserById, getUsers } from "../db/usersBd";

jest.mock("../db/users");

describe("Usuarios API", () => {
  let cookie = "";

  beforeAll(async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "admin@example.com", password: "adminpassword" });

    cookie = response.headers["set-cookie"][0];
  });

  describe("GET /users", () => {
    it("debería obtener todos los usuarios con rol admin", async () => {
      (getUsers as jest.Mock).mockResolvedValueOnce([
        { id: "1", nombre: "Juan", email: "juan@example.com" },
      ]);

      const response = await request(app).get("/users").set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: "1", nombre: "Juan", email: "juan@example.com" },
      ]);
    });
  });

  describe("PUT /users/:id", () => {
    it("debería actualizar un usuario existente", async () => {
      const userId = "1";
      (getUserById as jest.Mock).mockResolvedValueOnce({
        id: userId,
        nombre: "Juan",
        apellido: "Pérez",
      });

      const updatedData = { nombre: "Juan Actualizado", telefono: "123456789" };
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Cookie", cookie)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updatedData));
    });

    it("debería devolver un error si no hay datos para actualizar", async () => {
      const userId = "1";
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Cookie", cookie)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No hay datos para actualizar");
    });

    it("debería devolver un error si el usuario no existe", async () => {
      const userId = "nonexistent";
      (getUserById as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Cookie", cookie)
        .send({ nombre: "No Existe" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Usuario no encontrado");
    });
  });

  describe("DELETE /users/:id", () => {
    it("debería eliminar un usuario existente", async () => {
      const userId = "1";
      (deleteUserById as jest.Mock).mockResolvedValueOnce({ id: userId });

      const response = await request(app)
        .delete(`/users/${userId}`)
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Usuario eliminado" })
      );
    });
  });
});
