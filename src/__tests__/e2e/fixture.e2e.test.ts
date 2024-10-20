import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import Fixture from "../../models/Fixture";
import User from "../../models/User"; // Import User model if you have one
import RedisClient from "../../utils/redis";
import { testDBConnection } from "../../utils/dbConnect";
import Team from "../../models/Team";

const redisClient = RedisClient.getInstance();

// Helper function to generate random team details
function generateRandomTeamDetails() {
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
}

describe("Fixture API", () => {
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    await testDBConnection();
    agent = request.agent(app);

    await Fixture.deleteMany({});

    // Create a test user and generate a token
    await User.create({
      username: "testadmin",
      email: "test@example.com",
      password: "password123",
      role: "admin",
    });

    // Simulate login
    await agent
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" })
      .expect(200);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Fixture.deleteMany({});
    await mongoose.connection.close();

    if (redisClient) {
      await redisClient.quit();
    }
  });

  describe("POST /api/fixtures", () => {
    it("should create a new fixture", async () => {
      // Create teams first
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());
      const venue = `Stadium A ${new Date().getTime()}`;
      const fixtureData = {
        date: new Date(),
        venue,
        season: "2023",
        homeTeam: teamA._id,
        awayTeam: teamB._id,
        status: "pending",
        result: {
          homeTeam: 0,
          awayTeam: 0,
        },
      };

      const response = await agent
        .post("/api/fixtures")
        .send(fixtureData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.venue).toBe(venue);
    });
  });

  describe("GET /api/fixtures", () => {
    it("should return all fixtures", async () => {
      // Create teams first
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());
      const teamC = await Team.create(generateRandomTeamDetails());
      const teamD = await Team.create(generateRandomTeamDetails());

      await Fixture.create([
        {
          date: new Date(),
          teams: [teamA._id, teamB._id],
          venue: "Stadium A",
          season: "2023",
          homeTeam: teamA._id,
          awayTeam: teamB._id,
          status: "pending",
        },
        {
          date: new Date(),
          teams: [teamC._id, teamD._id],
          venue: "Stadium B",
          season: "2023",
          homeTeam: teamC._id,
          awayTeam: teamD._id,
          status: "completed",
        },
      ]);

      const response = await agent.get("/api/fixtures").expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /api/fixtures/:id", () => {
    it("should return a specific fixture", async () => {
      // Create teams first
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());
      const fixture = await Fixture.create({
        date: new Date(),
        teams: [teamA._id, teamB._id],
        venue: "Stadium A",
        season: "2023",
        homeTeam: teamA._id,
        awayTeam: teamB._id,
        status: "pending",
      });

      const response = await agent
        .get(`/api/fixtures/${fixture._id}`)
        .expect(200);

      expect(response.body.venue).toBe("Stadium A");
    });

    it("should return 404 for non-existent fixture", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await agent.get(`/api/fixtures/${nonExistentId}`).expect(404);
    });
  });

  describe("GET /api/fixtures/link/:uniqueLink", () => {
    it("should return a fixture by its uniqueLink", async () => {
      // Create teams first
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());
      const fixture = await Fixture.create({
        homeTeam: teamA._id,
        awayTeam: teamB._id,
        date: new Date(),
        venue: "Test Stadium",
        status: "pending",
        season: "2023",
      });

      const response = await agent
        .get(`/api/fixtures/link/${fixture.uniqueLink}`)
        .expect(200);

      expect(response.body.message).toBe("Fixture fetched successfully");
      expect(response.body.data.uniqueLink).toBe(fixture.uniqueLink);
    });

    it("should return 404 for non-existent uniqueLink", async () => {
      await request(app).get("/api/fixtures/link/nonexistentlink").expect(404);
    });
  });

  describe("patch /api/fixtures/:id", () => {
    it("should update a fixture", async () => {
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());

      const fixture = await Fixture.create({
        date: new Date(),
        teams: [teamA._id, teamB._id],
        venue: "Stadium A",
        season: "2023",
        homeTeam: teamA._id,
        awayTeam: teamB._id,
        status: "pending",
      });

      const response = await agent
        .patch(`/api/fixtures/${fixture._id}`)
        .send({ venue: "Stadium B" })
        .expect(200);

      expect(response.body.venue).toBe("Stadium B");
    });

    it("should return 404 for non-existent fixture", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await agent
        .patch(`/api/fixtures/${nonExistentId}`)
        .send({ venue: "Stadium B" })
        .expect(404);
    });
  });

  describe("DELETE /api/fixtures/:id", () => {
    it("should delete a fixture", async () => {
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());

      const fixture = await Fixture.create({
        date: new Date(),
        teams: [teamA._id, teamB._id],
        venue: "Stadium A",
        season: "2023",
        homeTeam: teamA._id,
        awayTeam: teamB._id,
        status: "pending",
      });

      await agent.delete(`/api/fixtures/${fixture._id}`).expect(200);

      const deletedFixture = await Fixture.findById(fixture._id);
      expect(deletedFixture).toBeNull();
    });

    it("should return 404 for non-existent fixture", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await agent.delete(`/api/fixtures/${nonExistentId}`).expect(404);
    });
  });

  describe("GET /api/fixtures/pending", () => {
    it("should return pending fixtures", async () => {
      // Create teams first
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());
      const teamC = await Team.create(generateRandomTeamDetails());
      const teamD = await Team.create(generateRandomTeamDetails());
      const teamE = await Team.create(generateRandomTeamDetails());
      const teamF = await Team.create(generateRandomTeamDetails());

      await Fixture.create([
        {
          date: new Date(),
          teams: [teamA._id, teamB._id],
          status: "pending",
          venue: "Stadium A",
          season: "2023",
          homeTeam: teamA._id,
          awayTeam: teamB._id,
        },
        {
          date: new Date(),
          teams: [teamC._id, teamD._id],
          status: "pending",
          venue: "Stadium B",
          season: "2023",
          homeTeam: teamC._id,
          awayTeam: teamD._id,
        },
        {
          date: new Date(),
          teams: [teamE._id, teamF._id],
          status: "completed",
          venue: "Stadium C",
          season: "2023",
          homeTeam: teamE._id,
          awayTeam: teamF._id,
        },
      ]);

      const response = await agent.get("/api/fixtures/pending").expect(200);

      expect(response.body.message).toBe(
        "Pending fixtures fetched successfully"
      );
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /api/fixtures/completed", () => {
    it("should return completed fixtures", async () => {
      // Create teams first
      const teamA = await Team.create(generateRandomTeamDetails());
      const teamB = await Team.create(generateRandomTeamDetails());
      const teamC = await Team.create(generateRandomTeamDetails());
      const teamD = await Team.create(generateRandomTeamDetails());
      const teamE = await Team.create(generateRandomTeamDetails());
      const teamF = await Team.create(generateRandomTeamDetails());

      await Fixture.create([
        {
          date: new Date(),
          teams: [teamA._id, teamB._id],
          status: "completed",
          venue: "Stadium A",
          season: "2023",
          homeTeam: teamA._id,
          awayTeam: teamB._id,
        },
        {
          date: new Date(),
          teams: [teamC._id, teamD._id],
          status: "completed",
          venue: "Stadium B",
          season: "2023",
          homeTeam: teamC._id,
          awayTeam: teamD._id,
        },
        {
          date: new Date(),
          teams: [teamE._id, teamF._id],
          status: "completed",
          venue: "Stadium C",
          season: "2023",
          homeTeam: teamE._id,
          awayTeam: teamF._id,
        },
      ]);

      const response = await agent.get("/api/fixtures/completed").expect(200);

      expect(response.body.message).toBe(
        "Completed fixtures fetched successfully"
      );
      expect(response.body.data).toBeDefined();
    });
  });
});
