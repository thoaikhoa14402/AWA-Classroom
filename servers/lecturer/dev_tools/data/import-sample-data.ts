import * as fs from 'fs'
import mongoose from 'mongoose';
import UserModel from '../../common/models/user.model';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('Connected to database successfully'));

// READ JSON FILE

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

// convert object_id ("$oid") in sample-data (users.json) to mongoose.Types.ObjectId
const modifiedUsers = users.map((user: any) => ({ 
  ...user,
  _id: new mongoose.Types.ObjectId(user._id.$oid)
}));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await UserModel.create(modifiedUsers);
    console.log('Loaded data successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await UserModel.deleteMany();
    console.log('Deleted data successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
