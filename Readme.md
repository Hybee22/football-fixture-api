# Football Fixture API

## Description

This Football Fixture API is a robust backend service designed to manage and provide information about football teams, fixtures, and stadiums. It offers comprehensive search functionality, allowing users to find teams and fixtures based on various criteria including team names, stadiums, and more.

## Features

- Team Management: Create, read, update, and delete football teams
- Fixture Management: Create, read, update, and delete football fixtures
- Advanced Search: Search for teams and fixtures with support for partial matching and relevance scoring
- Stadium-based Search: Find fixtures played in specific stadiums
- Pagination: Efficient data retrieval with paginated results for both teams and fixtures
- Data Validation: Ensure data integrity with schema-based validation

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Redis
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/hybee22/football-fixture-api.git
   ```

2. Navigate to the project directory:

   ```
   cd football-fixture-api
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:

- `NODE_ENV`: The environment in which the server will run (default: development)
- `PORT`: The port number on which the server will run (default: 9001)
- `REDIS_URL`: URL for Redis connection
- `SESSION_SECRET`: Secret key for session management
- `JWT_SECRET`: Secret key for JSON Web Token generation and verification
- `MONGODB_URI`: Your MongoDB connection string
- `TEST_MONGODB_URI`: Your MongoDB connection string for testing
- `FOOTBALL_DATA_API_KEY`: API key for football data provider
- `SEED_DATABASE`: Set to 'true' if you want to seed the database on startup, 'false' otherwise
- `SUPER_ADMIN_EMAIL`: Email for the super admin account
- `SUPER_ADMIN_PASSWORD`: Password for the super admin account

1. Build the TypeScript files:

   ```
   npm run build
   ```

2. Start the server:

   ```
   npm start
   ```

   For development with hot-reloading:

   ```
   npm run dev
   ```

3. If you want to seed the database, set `SEED_DATABASE=true` in your `.env` file before starting the server.

## API Endpoints

- `GET /api/teams`: Get all teams
- `POST /api/teams`: Create a new team
- `GET /api/teams/:id`: Get a specific team
- `PUT /api/teams/:id`: Update a team
- `DELETE /api/teams/:id`: Delete a team

- `GET /api/fixtures`: Get all fixtures
- `POST /api/fixtures`: Create a new fixture
- `GET /api/fixtures/:id`: Get a specific fixture
- `PUT /api/fixtures/:id`: Update a fixture
- `DELETE /api/fixtures/:id`: Delete a fixture

- `GET /api/search`: Search for teams and fixtures

## Search Functionality

The search endpoint (`GET /api/search`) accepts the following query parameters:

- `query`: The search term (required)
- `teamPage`: Page number for team results (default: 1)
- `fixturePage`: Page number for fixture results (default: 1)
- `limit`: Number of results per page (default: 10)

Additionally, the following filter parameters are now supported:

- `status`: Filter fixtures by status ("pending" or "completed")
- `season`: Filter fixtures by season
- `venue`: Filter fixtures by venue name
- `dateFrom`: Filter fixtures from this date (format: YYYY-MM-DD)
- `dateTo`: Filter fixtures up to this date (format: YYYY-MM-DD)
- `team`: Filter fixtures by team name (searches both home and away teams)
- `homeScore`: Filter fixtures by home team score (must be used with `awayScore`)
- `awayScore`: Filter fixtures by away team score (must be used with `homeScore`)

Example:

```
GET /api/search?query=Manchester&teamPage=1&fixturePage=2&limit=15&status=pending&season=2023&venue=Old%20Trafford&dateFrom=2023-01-01&dateTo=2023-12-31&team=United
```

This search query will:

- Search for "Manchester" in team names, short names, and stadiums
- Return page 1 of team results and page 2 of fixture results
- Limit results to 15 per page
- Filter fixtures to show only pending matches
- Show fixtures from the 2023 season
- Filter fixtures played at Old Trafford
- Show fixtures between January 1, 2023, and December 31, 2023
- Include fixtures where Manchester United is playing (home or away)

The API returns a JSON response containing:

- Matched teams with pagination information
- Matched fixtures with pagination information
- Applied filters
- Search metadata (query, timestamp, etc.)

Note: The search is designed to be flexible. You can use any combination of these parameters to refine your search results.

## Testing

Run the test suite with:

```
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

Ibrahim Adekunle - adefemi101@gmail.com

Project Link: [https://github.com/hybee22/football-fixture-api](https://github.com/hybee22/football-fixture-api)

## API Documentation

For detailed API documentation and examples, please refer to our Postman collection:

[Football Fixture API Documentation](https://documenter.getpostman.com/view/7036082/2sAXxWbA2t)

This documentation provides comprehensive information about all available endpoints, request/response formats, and authentication requirements.

## Docker Compose Files

I have updated our Docker Compose files to comply with the latest Docker Compose syntax.

### Running the Application

To run the application in different environments, use the following commands:

- Development: `docker-compose up`
- Testing: `docker-compose -f docker-compose.testing.yml up`
