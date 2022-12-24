const request = require("supertest");
const { Customer } = require("../../models/customer");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const { Movie } = require("../../models/movie");

let server;

describe("/api/returns", () => {
  let customerId = mongoose.Types.ObjectId();
  let movieId = mongoose.Types.ObjectId();
  let rental;
  let movie;
  beforeEach(async () => {
    server = require("../../index");

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "12345" },
      numberInStock: 10,
    });
    await movie.save();

    rental = new Rental({
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
      customer: {
        _id: customerId,
        name: "12345",
        phone: "1234567",
      },
    });
    await rental.save();
  });
  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  it("should return 401 if client is not logged in", async () => {
    const res = await request(server)
      .post("/api/returns/")
      .send({ customerId: customerId, movieId: movieId });
    console.log(res.status);
    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({ movieId: movieId });

    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({ customerId: customerId });

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental is found for this customer/movie", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: mongoose.Types.ObjectId(),
        movieId: movieId,
      });

    expect(res.status).toBe(404);
  });

  it("should return 400 if rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: customerId,
        movieId: movieId,
      });

    expect(res.status).toBe(400);
  });

  it("should return 200 if request is valid", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: customerId,
        movieId: movieId,
      });

    expect(res.status).toBe(200);
  });

  it("should set the returnDate if input is valid", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: customerId,
        movieId: movieId,
      });

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rental fee if input is valid", async () => {
    let d = new Date();
    d.setDate(d.getDate() - 5);
    rental.dateOut = d;
    await rental.save();

    const token = new User().generateAuthToken();
    await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: customerId,
        movieId: movieId,
      });

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(10);
  });

  it("should increase the movie stock if input is valid", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: customerId,
        movieId: movieId,
      });

    const movieInDb = await Movie.findById(movieId);

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental if input is valid", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({
        customerId: customerId,
        movieId: movieId,
      });

    const rentalInDb = await Rental.findById(rental._id);

    expect(res.body).toHaveProperty("dateOut");
    expect(res.body).toHaveProperty("dateReturned");
    expect(res.body).toHaveProperty("rentalFee");
    expect(res.body).toHaveProperty("customer", {
      _id: customerId.toHexString(),
      name: "12345",
      phone: "1234567",
      isGold: false,
    });
    expect(res.body).toHaveProperty("movie");
  });
});
