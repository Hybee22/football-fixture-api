import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import shortid from "shortid";
import Team from "../models/Team";
import Fixture from "../models/Fixture";
import logger from "../utils/logger";

dotenv.config();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";
const MONGODB_URI = process.env.MONGODB_URI ?? "";

// EPL competition ID
const EPL_ID = "39";
const SEASONS = ["2022"];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB for seeding");

    // Fetch and seed teams
    await seedTeams();

    // Fetch and seed fixtures for multiple seasons
    for (const season of SEASONS) {
      await seedFixtures(season);
    }
  } catch (error) {
    logger.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB after seeding");
  }
}

async function seedTeams() {
  const teamsResponse = await axios.get(
    `${BASE_URL}/teams?league=${EPL_ID}&season=${SEASONS[0]}`,
    {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }
  );

  const teams = teamsResponse.data.response;
  let createdCount = 0;

  for (const team of teams) {
    const existingTeam = await Team.findOne({ name: team.team.name });
    if (!existingTeam) {
      await Team.create({
        name: team.team.name,
        shortName: team.team.code,
        founded: team.team.founded,
        stadium: team.venue.name,
      });
      createdCount++;
    }
  }

  logger.info(`${createdCount} new teams seeded successfully`);
}

async function seedFixtures(season: string) {
  const fixturesResponse = await axios.get(
    `${BASE_URL}/fixtures?league=${EPL_ID}&season=${season}`,
    {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }
  );

  const fixtures = fixturesResponse.data.response;
  let createdCount = 0;

  for (const record of fixtures) {
    const { fixture, teams, goals } = record;
    const homeTeam = await Team.findOne({ name: teams.home.name });
    const awayTeam = await Team.findOne({ name: teams.away.name });

    if (homeTeam && awayTeam) {
      const existingFixture = await Fixture.findOne({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        date: new Date(fixture.date),
      });

      if (!existingFixture) {
        const matchStatus = ["pending", "completed"];
        const status =
          matchStatus[Math.floor(Math.random() * matchStatus.length)];

        await Fixture.create({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          date: new Date(fixture.date),
          status: status,
          season: season,
          venue: fixture.venue.name,
          result: {
            homeScore: goals.home,
            awayScore: goals.away,
          },
          uniqueLink: shortid.generate(),
        });
        createdCount++;
      }
    }
  }

  logger.info(`${createdCount} new fixtures seeded for season ${season}`);
}

export default seedDatabase;
