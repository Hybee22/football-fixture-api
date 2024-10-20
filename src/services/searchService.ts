import Team from "../models/Team";
import Fixture from "../models/Fixture";

export class SearchService {
  async searchTeamsAndFixtures(
    query: string,
    teamPage: number = 1,
    fixturePage: number = 1,
    limit: number = 10
  ) {
    const teamSkip = (teamPage - 1) * limit;
    const fixtureSkip = (fixturePage - 1) * limit;

    // Check if the query is a valid date
    const dateQuery = new Date(query);
    const isDateQuery = !isNaN(dateQuery.getTime());

    let searchConditions: any = {};
    let teamIds: any[] = [];
    let fixtureSearchConditions: any = {};
    let teams: any[] = [];
    let isStadiumSearch = false;

    if (isDateQuery) {
      // If it's a date query, we only search fixtures
      const startOfDay = new Date(dateQuery.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateQuery.setHours(23, 59, 59, 999));
      fixtureSearchConditions = {
        date: { $gte: startOfDay, $lte: endOfDay }
      };
    } else {
      // First, check if the query exactly matches a stadium name
      const stadiumMatch = await Team.findOne({
        stadium: new RegExp(`^${query}$`, "i"),
      });

      if (stadiumMatch) {
        isStadiumSearch = true;
        teams = [stadiumMatch];
        fixtureSearchConditions = {
          $or: [{ venue: stadiumMatch.stadium }],
        };
      } else {
        // If it's not a stadium match, proceed with the regular search
        const tokens = query
          .toLowerCase()
          .split(/\s+/)
          .filter((token) => token.length > 0);
        const regexPatterns = tokens.map((token) => new RegExp(token, "i"));

        searchConditions = {
          $or: [
            { name: { $in: regexPatterns } },
            { shortName: { $in: regexPatterns } },
            { stadium: { $in: regexPatterns } },
          ],
        };

        teams = await Team.aggregate([
          { $match: searchConditions },
          {
            $addFields: {
              score: {
                $add: [
                  { $cond: [{ $in: [{ $toLower: "$name" }, tokens] }, 3, 0] },
                  {
                    $cond: [{ $in: [{ $toLower: "$shortName" }, tokens] }, 2, 0],
                  },
                  { $cond: [{ $in: [{ $toLower: "$stadium" }, tokens] }, 2, 0] },
                  {
                    $size: {
                      $setIntersection: [
                        tokens,
                        { $split: [{ $toLower: "$name" }, " "] },
                      ],
                    },
                  },
                ],
              },
            },
          },
          { $sort: { score: -1 } },
          { $skip: teamSkip },
          { $limit: limit },
        ]);

        teamIds = teams.map((team) => team._id);
        fixtureSearchConditions = {
          $or: [{ homeTeam: { $in: teamIds } }, { awayTeam: { $in: teamIds } }],
        };
      }
    }

    const teamCountPromise = isDateQuery
      ? Promise.resolve(0)
      : isStadiumSearch
      ? Promise.resolve(1)
      : Team.countDocuments(searchConditions);
    const fixturesPromise = Fixture.find(fixtureSearchConditions)
      .populate("homeTeam awayTeam")
      .skip(fixtureSkip)
      .limit(limit);
    const fixtureCountPromise = Fixture.countDocuments(fixtureSearchConditions);

    const [teamCount, fixtures, fixtureCount] = await Promise.all([
      teamCountPromise,
      fixturesPromise,
      fixtureCountPromise,
    ]);

    return {
      status: "success",
      timestamp: new Date().toISOString(),
      query: query,
      isDateSearch: isDateQuery,
      isStadiumSearch: isStadiumSearch,
      results: {
        teams: {
          items: teams,
          pagination: {
            total: teamCount,
            page: teamPage,
            limit,
            totalPages: Math.ceil(teamCount / limit),
          },
        },
        fixtures: {
          items: fixtures,
          pagination: {
            total: fixtureCount,
            page: fixturePage,
            limit,
            totalPages: Math.ceil(fixtureCount / limit),
          },
        },
      },
    };
  }
}

export const searchService = new SearchService();
