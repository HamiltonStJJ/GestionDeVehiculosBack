import request from "supertest";
import app from "../index";

describe("POST /auth/register", () => {
  it("should register a new user successfully", async () => {
    const response = await request(app).post("/auth/register").send({
      cedula: "12345678",
      nombre: "Juan",
      apellido: "Perez",
      direccion: "123 Calle Falsa",
      telefono: "5551234",
      email: "programas2017hax@gmail.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
  });

  it("should fail when required fields are missing", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "juan@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Faltan datos");
  });
});

describe("POST /auth/login", () => {
  it("should log in a user with correct credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "programas2017hax@gmail.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("authentication");
  });

  it("should not log in a user without email", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Datos incorrectos");
  });

  it("should not log in a user with incorrect credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "juan@example.com", password: "wrongpassword" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Usuario no encontrado");
  });

  it("should not log in a user with incorrect credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "programas2017hax@gmail.com", password: "wrongpassword" });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Contraseña incorrecta");
  });
});

describe("POST /auth/forgot", () => {
  it("should send a password reset email", async () => {
    const response = await request(app)
      .post("/auth/forgot")
      .send({ email: "programas2017hax@gmail.com" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Correo de recuperación enviado");
  });

  it("without email should return an error", async () => {
    const response = await request(app).post("/auth/forgot").send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Falta el email");
  });

  it("should return an error for a non-existing email", async () => {
    const response = await request(app)
      .post("/auth/forgot")
      .send({ email: "notfound@example.com" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuario no encontrado");
  });
});

describe("POST /auth/change", () => {
  let token = "";

  it("should change the password for an authenticated user", async () => {
    const response = await request(app)
      .post("/auth/change")
      .set("Cookie", `auth=${token}}`)
      .send({ newPassword: "newPassword123" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Contraseña cambiada exitosamente");
  });

  it("should return an error if no new password is provided", async () => {
    const response = await request(app)
      .post("/auth/change")
      .set("Cookie", `auth=${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Se requiere una nueva contraseña");
  });
});

describe("POST /auth/logout", () => {
  let token = "";
  it("should log out an authenticated user", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", `auth=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Sesión cerrada");
  });
});
