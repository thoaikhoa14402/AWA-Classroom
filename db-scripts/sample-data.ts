import * as fs from 'fs'
import mongoose from 'mongoose';
import UserModel from './models/user.model';
import ClassModel from './models/class.model';



const MONGO_URI = 'mongodb+srv://thoaikhoa1442002:khoa1442002@awa-2023.mxpzkjz.mongodb.net/AWA_2023?retryWrites=true&w=majority'

mongoose
  .connect(MONGO_URI as string)
  .then(() => console.log('Connected to database successfully'));

// READ JSON FILE

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

const classes = JSON.parse(
  fs.readFileSync(`${__dirname}/classes.json`, 'utf8')
);

// convert object_id ("$oid") in sample-data (users.json) to mongoose.Types.ObjectId
const modifiedUsers = users.map((user: any) => ({ 
  ...user,
  _id: new mongoose.Types.ObjectId(user._id.$oid)
}));

const modifiedClasses = classes.map((s_class: any) => ({ 
  ...s_class,
  _id: new mongoose.Types.ObjectId(s_class._id.$oid),
  createAt: new Date(s_class.createAt.$date),
  students: s_class.students.map((item: any) =>  (new mongoose.Types.ObjectId(item.$oid))),
  lecturers: s_class.lecturers.map((item: any) =>  (new mongoose.Types.ObjectId(item.$oid))),
  owner: new mongoose.Types.ObjectId(s_class.owner.$oid),
  gradeColumns: s_class.gradeColumns.map((item: any) => ({...item, _id: new mongoose.Types.ObjectId(item._id.$oid)})),
  studentList: s_class.studentList.map((item: any) => ({...item, _id: new mongoose.Types.ObjectId(item._id.$oid)})),
  gradeList: s_class.gradeList.map((item: any) => {
    return {
      ...item,
      _id: new mongoose.Types.ObjectId(item._id.$oid),
      grade: item.grade.map((grade_item: any) => ({...grade_item, _id: new mongoose.Types.ObjectId(grade_item._id.$oid)})),
    }
  }),
}));

// IMPORT USER DATA INTO DB
const importUserData = async () => {
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

// DELETE USER DATA FROM DB
const deleteUserData = async () => {
  try {
    await UserModel.deleteMany();
    console.log('Deleted data successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// IMPORT CLASS DATA INTO DB
const importClassData = async () => {
  try {
    for (const s_class of modifiedClasses) {
      await ClassModel.create(s_class);
    }
    console.log('Loaded data successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE CLASS DATA FROM DB
const deleteClassData = async () => {
  try {
    await ClassModel.deleteMany();
    console.log('Deleted data successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};


if (process.argv[2] === '--import-users') {
  importUserData();
} else if (process.argv[2] === '--delete-users') {
  deleteUserData();
} else if (process.argv[2] === '--import-classes') {
  importClassData();
} 
else if (process.argv[2] === '--delete-classes') {
  deleteClassData();
}
