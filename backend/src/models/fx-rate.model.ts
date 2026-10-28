import { Schema, model } from 'mongoose';

const fxRateSchema = new Schema({
  key: { type: String, required: true },
  base: { type: String, required: true },
  rates: { type: Schema.Types.Mixed, default: {} },
  fetchedAt: { type: Date, required: true },
  checkedAt: { type: Date, required: true },
});

fxRateSchema.index({ key: 1 }, { unique: true });

export const FxRate = model('FxRate', fxRateSchema);
