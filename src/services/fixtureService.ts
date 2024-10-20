import Fixture from "../models/Fixture";
import { paginationResult } from "../utils/pagination";
import RedisClient from "../utils/redis";

const redisClient = RedisClient.getInstance();

export class FixtureService {
  async getAllFixtures(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [fixtures, total] = await Promise.all([
      Fixture.find().populate("homeTeam awayTeam").skip(skip).limit(limit),
      Fixture.countDocuments(),
    ]);
    return paginationResult(fixtures, total, page, limit);
  }

  async getFixtureById(id: string) {
    return await Fixture.findById(id).populate("homeTeam awayTeam");
  }

  async getFixtureByUniqueLink(uniqueLink: string) {
    return await Fixture.findOne({ uniqueLink }).populate("homeTeam awayTeam");
  }

  async getPendingFixtures(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const cacheKey = `pending_fixtures_${page}_${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const [fixtures, total] = await Promise.all([
      Fixture.find({ status: "pending" })
        .populate("homeTeam awayTeam")
        .skip(skip)
        .limit(limit),
      Fixture.countDocuments({ status: "pending" }),
    ]);
    const result = paginationResult(fixtures, total, page, limit);
    await redisClient.set(cacheKey, JSON.stringify(result), "EX", 300);

    return result;
  }

  async getCompletedFixtures(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const cacheKey = `completed_fixtures_${page}_${limit}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const [fixtures, total] = await Promise.all([
      Fixture.find({ status: "completed" })
        .populate("homeTeam awayTeam")
        .skip(skip)
        .limit(limit),
      Fixture.countDocuments({ status: "completed" }),
    ]);
    const result = paginationResult(fixtures, total, page, limit);
    await redisClient.set(cacheKey, JSON.stringify(result), "EX", 300);

    return result;
  }

  async createFixture(fixtureData: any) {
    const newFixture = new Fixture(fixtureData);
    const savedFixture = await newFixture.save();
    await redisClient.del("pending_fixtures");
    return savedFixture;
  }

  async updateFixture(id: string, fixtureData: any) {
    const updatedFixture = await Fixture.findByIdAndUpdate(id, fixtureData, {
      new: true,
    }).populate("homeTeam awayTeam");
    if (updatedFixture) {
      await redisClient.del("pending_fixtures");
      await redisClient.del("completed_fixtures");
    }
    return updatedFixture;
  }

  async deleteFixture(id: string) {
    const deletedFixture = await Fixture.findByIdAndDelete(id);
    if (deletedFixture) {
      await redisClient.del("pending_fixtures");
      await redisClient.del("completed_fixtures");
    }
    return deletedFixture;
  }
}

export const fixtureService = new FixtureService();
