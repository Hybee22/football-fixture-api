import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import Team from "../../models/Team";
import User from "../../models/User";
import RedisClient from "../../utils/redis";
import { testDBConnection } from "../../utils/dbConnect";

const redisClient = RedisClient.getInstance();

// Helper function to generate random team data
const generateRandomTeamData = () => {
  const adjectives = [
    "Mighty",
    "Swift",
    "Brave",
    "Fierce",
    "Royal",
    "Golden",
    "Silver",
    "Bronze",
    "Iron",
    "Steel",
  ];
  const nouns = [
    "Lions",
    "Eagles",
    "Tigers",
    "Bears",
    "Wolves",
    "Hawks",
    "Falcons",
    "Panthers",
    "Jaguars",
    "Leopards",
  ];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const fullName = `${randomAdjective} ${randomNoun}`;
  return {
    name: fullName + new Date().getTime(),
    shortName: `${randomAdjective[0]}${randomNoun[0] + new Date().getTime()}`,
    stadium: `${fullName} Stadium ${new Date().getTime()}`,
    founded: `${1900 + Math.floor(Math.random() * 123)}`, // Random year between 1900 and 2022
  };
};

describe("Team API", () => {
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    await testDBConnection();
    agent = request.agent(app);

    await User.deleteMany({});
    await Team.deleteMany({});

    const username = `test ${new Date().getTime()}`;
    const email = `${username}@mailinator.com`;

    // Create a test user and get auth token
    await User.create({
      username,
      email,
      password: "password123",
      role: "admin",
    });

    await agent
      .post("/api/auth/login")
      .send({ email, password: "password123" })
      .expect(200);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await mongoose.connection.close();

    if (redisClient) {
      await redisClient.quit();
    }
  });

  describe("POST /api/teams", () => {
    it("should create a new team", async () => {
      const teamData = generateRandomTeamData();
      const response = await agent
        .post("/api/teams")
        .send(teamData)
        .expect(201);

      expect(response.body.message).toBe("Team created successfully");
    });
  });

  describe("GET /api/teams", () => {
    it("should return all teams", async () => {
      await Team.create([generateRandomTeamData(), generateRandomTeamData()]);

      const response = await agent.get("/api/teams").expect(200);

      expect(response.body.message).toBe("Teams fetched successfully");
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /api/teams/:id", () => {
    it("should return a specific team", async () => {
      const team = await Team.create(generateRandomTeamData());

      const response = await agent.get(`/api/teams/${team._id}`).expect(200);

      expect(response.body.message).toBe("Team fetched successfully");
    });

    it("should return 404 for non-existent team", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await agent.get(`/api/teams/${nonExistentId}`).expect(404);
    });
  });

  describe("PATCH /api/teams/:id", () => {
    it("should update a team", async () => {
      const team = await Team.create(generateRandomTeamData());
      const updateData = generateRandomTeamData();

      const response = await agent
        .patch(`/api/teams/${team._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Team updated successfully");
      expect(response).toBeDefined();
    });

    it("should return 404 for non-existent team", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { name: "New Name", shortName: "NN", founded: "1901" };

      await agent
        .patch(`/api/teams/${nonExistentId}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe("DELETE /api/teams/:id", () => {
    it("should delete a team", async () => {
      const team = await Team.create(generateRandomTeamData());

      const response = await agent.delete(`/api/teams/${team._id}`).expect(200);

      expect(response.body.message).toBe("Team deleted successfully");

      const deletedTeam = await Team.findById(team._id);
      expect(deletedTeam).toBeNull();
    });

    it("should return 404 for non-existent team", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await agent.delete(`/api/teams/${nonExistentId}`).expect(404);
    });
  });
});
