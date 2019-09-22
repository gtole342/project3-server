import { Document, Model, model, Schema } from "mongoose";

export interface IAddressModel extends Document {
  city: string;
  country: string;
  geoLocation: {};
  state: string;
  street: string;
  streetNumber: string;
  streetSuffix: string;
  zipcode: string;
}

export const AddressSchema: Schema = new Schema({
  city: String,
  country: String,
  location: {},
  state: String,
  street: String,
  streetNumber: String,
  streetSuffix: String,
  zipcode: String,
});

export const Address: Model<IAddressModel> = model<IAddressModel>("Address", AddressSchema);
