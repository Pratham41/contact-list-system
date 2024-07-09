const request = require("supertest");
const app = require("../app.js");
const client = require("../config/db.js");

beforeAll(async () => {
  await client.phoneNumber.deleteMany();
  await client.contact.deleteMany();
});

afterAll(async () => {
  await client.$disconnect();
});

describe("Contact Management API", () => {
  test("should create a new contact", async () => {
    const res = await request(app)
      .post("/api/v1/contacts")
      .send({ name: "John Doe", phoneNumbers: ["1234567890", "0987654321"] });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual("John Doe");
  });

  test("should fetch all contacts", async () => {
    const res = await request(app).get("/api/v1/contacts");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("should search for a contact", async () => {
    const res = await request(app).get("/api/contacts/v1/search?query=John");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("should fetch a single contact", async () => {
    const contact = await client.contact.findFirst();
    const res = await request(app).get(`/api/v1/contacts/${contact.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(contact.id);
  });

  test("should update a contact", async () => {
    const contact = await client.contact.findFirst();
    const res = await request(app)
      .put(`/api/v1/contacts/${contact.id}`)
      .send({ name: "Jane Doe", phoneNumbers: ["1234567890"] });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Contact updated successfully");
  });

  test("should delete a contact", async () => {
    const contact = await client.contact.findFirst();
    const res = await request(app).delete(`/api/v1/contacts/${contact.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
