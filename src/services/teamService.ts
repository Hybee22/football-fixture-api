import Team, { ITeam } from "../models/Team";
import { paginationResult } from "../utils/pagination";
import RedisClient from "../utils/redis";

const redisClient = RedisClient.getInstance();

export class TeamService {
  async createTeam(teamData: Partial<ITeam>): Promise<ITeam> {
    const team: ITeam = new Team(teamData);
    return await team.save();
  }

  async getAllTeams(page: number, limit: number) {
    const cachedTeams = await redisClient.get("all_teams");
    if (cachedTeams) {
      return JSON.parse(cachedTeams);
    }

    const skip = (page - 1) * limit;
    const cacheKey = `all_teams_${page}_${limit}`;

    const [teams, total] = await Promise.all([
      Team.find().skip(skip).limit(limit),
      Team.countDocuments(),
    ]);
    const result = paginationResult(teams, total, page, limit);
    await redisClient.set(cacheKey, JSON.stringify(result), "EX", 300);

    return result;
  }

  async getTeamById(teamId: string): Promise<ITeam | null> {
    const cachedTeam = await redisClient.get(`team:${teamId}`);
    if (cachedTeam) {
      return JSON.parse(cachedTeam);
    }

    const team = await Team.findById(teamId);
    if (team) {
      await redisClient.set(`team:${teamId}`, JSON.stringify(team), "EX", 3600); // Cache for 1 hour
    }
    return team;
  }

  async updateTeam(teamId: string, teamData: any): Promise<ITeam | null> {
    const team = await Team.findByIdAndUpdate(teamId, teamData, { new: true });
    if (team) {
      await redisClient.del(`team:${teamId}`);
      await redisClient.del("all_teams");
    }
    return team;
  }

  async deleteTeam(teamId: string): Promise<boolean> {
    const team = await Team.findByIdAndDelete(teamId);
    if (team) {
      await redisClient.del(`team:${teamId}`);
      await redisClient.del("all_teams");
      return true;
    }
    return false;
  }
}

export const teamService = new TeamService();
