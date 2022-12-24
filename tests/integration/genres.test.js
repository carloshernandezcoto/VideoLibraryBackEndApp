const { default: mongoose } = require("mongoose");
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return the requested genre", async () => {
      const genre = new Genre({ name: "genre3" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);
      // const insertion = await Genre.collection.insertMany([{ name: "genre3" }]);
      // const endPoint = "/api/genres/" + insertion.insertedIds["0"].toString();
      // const res = await request(server).get(endPoint);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
      expect(res.body.name).toBe("genre3");
    });
    it("should return 404 if id does not exist", async () => {
      const genre = new Genre({ name: "genre4" });
      await genre.save();
      const res = await request(server).get("/api/genres/1");
      expect(res.status).toBe(404);
    });
    it("should return 404 if no genre with the given id exists", async () => {
      const genre = new Genre({ name: "genre4" });
      await genre.save();
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    it("should return 401 if no token is sent", async () => {
      const res = await request(server)
        .post("/api/genres/")
        .send({ name: "genre5" });
      expect(res.status).toBe(401);
    });
    it("should return 400 if the genre is less than 3 characters long", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name: "ge" });
      expect(res.status).toBe(400);
    });
    it("should save the new genre in the DB", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name: "genre6" });

      const genre = await Genre.find({ name: "genre6" });

      expect(genre).not.toBeNull();
    });
    it("should return new genre saved to the DB", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name: "genre6" });

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre6");
    });
  });
});
