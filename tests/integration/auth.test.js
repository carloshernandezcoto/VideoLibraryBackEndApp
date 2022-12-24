const request = require("supertest");
const { Customer } = require("../../models/customer");
const { User } = require("../../models/user");
let server;

describe("auth middleware", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
  });

  describe("auth middleware", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await request(server).post("/api/customers").send({
        name: "Some name",
        isGold: false,
        phone: "some phone",
      });
      expect(res.status).toBe(401);
    });
  });

  it("should return 400 if wrong token is provided", async () => {
    const res = await request(server)
      .post("/api/customers")
      .set("x-auth-token", "123")
      .send({
        name: "Some name",
        isGold: false,
        phone: "some phone",
      });
    expect(res.status).toBe(400);
  });

  it("should return status 200 if token is valid", async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/api/customers")
      .set("x-auth-token", "123")
      .set("x-auth-token", token)
      .send({
        name: "Some name",
        isGold: false,
        phone: "some phone",
      });
    expect(res.status).toBe(200);
  });
});
