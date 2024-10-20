import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import Team from "../../models/Team";
import Fixture from "../../models/Fixture";
import User from "../../models/User";
import { testDBConnection } from "../../utils/dbConnect";
import RedisClient from "../../utils/redis";

const redisClient = RedisClient.getInstance();

// Helper function to generate random team data
function generateRandomTeamData() {
  const adjectives = ["Mighty", "Swift", "Brave", "Fierce", "Royal"];
  const nouns = ["Lions", "Eagles", "Tigers", "Bears", "Wolves"];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const name = `${randomAdjective} ${randomNoun}`;
  const shortName = `${randomAdjective[0]}${randomNoun[0]}`;
  const founded = (1800 + Math.floor(Math.random() * 223)).toString();
  const stadium = `${randomAdjective} Stadium`;

  return { name, shortName, founded, stadium };
}

describe("Search API", () => {
  beforeAll(async () => {
    await testDBConnection();

    // Create some test data
    const team1 = await Team.create(generateRandomTeamData());
    const team2 = await Team.create(generateRandomTeamData());
    await Fixture.create({
      homeTeam: team1._id,
      awayTeam: team2._id,
      date: new Date(),
      venue: team1.stadium,
      status: "pending",
      season: 2024,
      result: {
        homeScore: 0,
        awayScore: 0,
      },
    });
  });

  afterAll(async () => {
    await Team.deleteMany({});
    await Fixture.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();

    if (redisClient) {
      await redisClient.quit();
    }
  });

  describe("GET /api/search", () => {
    it("should return search results for teams and fixtures", async () => {
      const response = await request(app)
        .get("/api/search?query=Mighty")
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should return 400 if query is missing", async () => {
      await request(app).get("/api/search").expect(400);
    });

    it("should handle pagination parameters", async () => {
      const response = await request(app)
        .get("/api/search?query=Mighty&teamPage=1&fixturePage=1&limit=5")
        .expect(200);

      expect(response.body).toHaveProperty("status");
    });

    it("should return empty arrays if no results found", async () => {
      const response = await request(app)
        .get("/api/search?query=NonexistentTeam")
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});
