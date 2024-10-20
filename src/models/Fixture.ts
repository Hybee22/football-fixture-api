import mongoose, { Schema, Document } from "mongoose";
import shortid from "shortid";

export interface IFixture extends Document {
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date: Date;
  status: "pending" | "completed";
  result?: {
    homeScore: number;
    awayScore: number;
  };
  uniqueLink: string;
}

const FixtureSchema: Schema = new Schema(
  {
    homeTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    date: { type: Date, required: true },
    season: { type: String, required: true },
    venue: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    result: {
      homeScore: { type: Number },
      awayScore: { type: Number },
    },
    uniqueLink: {
      type: String,
      unique: true,
      default: shortid.generate
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IFixture>("Fixture", FixtureSchema);
