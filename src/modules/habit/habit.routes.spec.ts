import { Server } from 'http';
import supertest from "supertest";
import { Mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { app } from "../../index";
import { databaseSetup } from '../../database';

// Server
let server: Server;
let request: supertest.SuperAgentTest;

// Database
let mongoMemoryServer: MongoMemoryServer;
let mongoConnection: Mongoose;

beforeAll(async () => {
  // Server
  server = app.listen();
  request = supertest.agent(server);

  // Database
  mongoMemoryServer = new MongoMemoryServer();
  mongoConnection = await databaseSetup(await mongoMemoryServer.getUri());

  return Promise.resolve();
});

afterAll(async () => {
  // Server
  server.close();

  // Database
  await mongoConnection.disconnect();
  await mongoMemoryServer.stop();

  return Promise.resolve();
});

let itemId: string;
const itemName = "Breathing";
const itemNameUpdated = "Meditation";

const responseType = "application/json";

describe("habit.routes", () => {
  it("create", async () => {
    const response = await request.post("/habits").send({
      name: itemName
    });

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toBeDefined();
    expect(response.body.name).toEqual(itemName);

    itemId = response.body._id;
  });

  it("findAll", async () => {
    const response = await request.get("/habits");

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body[0].name).toEqual(itemName);
  });

  it("find", async () => {
    const response = await request.get(`/habits/${itemId}`);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toEqual(itemId);
  });

  it("update", async () => {
    const response = await request.patch(`/habits/${itemId}`).send({
      name: itemNameUpdated
    });

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toEqual(itemId);
    expect(response.body.name).toEqual(itemNameUpdated);
  });

  it("delete", async () => {
    const response = await request.delete(`/habits/${itemId}`);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toEqual(itemId);
    expect(response.body.name).toEqual(itemNameUpdated);
  });
});