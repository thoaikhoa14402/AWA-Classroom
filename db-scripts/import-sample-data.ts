import * as fs from 'fs'
import mongoose from 'mongoose';
import UserModel from './models/user.model';

const MONGO_URI = 'mongodb+srv://thoaikhoa1442002:khoa1442002@awa-2023.mxpzkjz.mongodb.net/AWA_2023?retryWrites=true&w=majority'

mongoose
  .connect(MONGO_URI as string)
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
    for (const user of modifiedUsers) {
      await UserModel.create(user);
    }
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

if (process.argv[2] === '--import-users') {
  importData();
} else if (process.argv[2] === '--delete-users') {
  deleteData();
}
