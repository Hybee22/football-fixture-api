import "./utils/redis";
import app from "./app";
import logger from "./utils/logger";
import seedDatabase from "./seeders/seed";
import seedSuperAdmin from "./seeders/superAdminSeeder";

const PORT = process.env.PORT ?? 9001;

const server = app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  if (process.env.SEED_DATABASE === "true") {
    try {
      await seedSuperAdmin();
      await seedDatabase();
      logger.info("Database seeded successfully");
    } catch (error) {
      logger.error("Error seeding database:", error);
    }
  }
});

export default server;
