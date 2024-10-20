import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  shortName: string;
  founded: number;
  stadium: string;
}

const TeamSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true, unique: true },
    founded: { type: Number, required: true },
    stadium: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TeamSchema.index({ name: "text", shortName: "text", stadium: "text" });

export default mongoose.model<ITeam>("Team", TeamSchema);
