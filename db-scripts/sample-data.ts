import * as fs from 'fs'
import mongoose from 'mongoose';
import UserModel from './models/user.model';
import ClassModel from './models/class.model';
import JoinedClassInfoModel from './models/joinedClassInfo.model';

const MONGO_URI = 'mongodb+srv://thoaikhoa1442002:khoa1442002@awa-2023.mxpzkjz.mongodb.net/AWA_2023?retryWrites=true&w=majority'

// READ JSON FILE

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);

const classes = JSON.parse(
  fs.readFileSync(`${__dirname}/data/classes.json`, 'utf8')
);

const joinedClassInfos = JSON.parse(
  fs.readFileSync(`${__dirname}/data/joined_class_infos.json`, 'utf8')
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

const modifiedJoinedClassInfos = joinedClassInfos.map((joined_class_info: any) => 
({
  ...joined_class_info,
  _id: new mongoose.Types.ObjectId(joined_class_info._id.$oid),
  user: new mongoose.Types.ObjectId(joined_class_info.user.$oid),
  class: new mongoose.Types.ObjectId(joined_class_info.class.$oid),
  joinedAt: new Date(joined_class_info.joinedAt.$date),
}));

// IMPORT USER DATA INTO DB
const importUserData = async () => {
  try {
    for (const user of modifiedUsers) {
      await UserModel.create(user);
    }
    console.log('Loaded user data successfully!');
  } catch (err) {
    console.log(err);
  }
};

// DELETE USER DATA FROM DB
const deleteUserData = async () => {
  try {
    await UserModel.deleteMany();
    console.log('Deleted user data successfully!');
  } catch (err) {
    console.log(err);
  }
};

// IMPORT CLASS DATA INTO DB
const importClassData = async () => {
  try {
    for (const s_class of modifiedClasses) {
      await ClassModel.create(s_class);
    }
    console.log('Loaded class data successfully!');
  } catch (err) {
    console.log(err);
  }
};

// DELETE CLASS DATA FROM DB
const deleteClassData = async () => {
  try {
    await ClassModel.deleteMany();
    console.log('Deleted class data successfully!');
  } catch (err) {
    console.log(err);
  }
};

// IMPORT JOINED CLASS INFO DATA INTO DB
const importJoinedClassInfoData = async () => {
  try {
    for (const joined_class_info of modifiedJoinedClassInfos) {
      await JoinedClassInfoModel.create(joined_class_info);
    }
    console.log('Loaded joined class info data successfully!');
  } catch (err) {
    console.log(err);
  }
};

// DELETE JOINED CLASS INFO DATA FROM DB
const deleteJoinedClassInfoData = async () => {
  try {
    await JoinedClassInfoModel.deleteMany();
    console.log('Deleted joined class info data successfully!');
  } catch (err) {
    console.log(err);
  }
};


async function execute(command: string) {
  await mongoose
  .connect(MONGO_URI as string);

  console.log('Connected to database successfully');

  if (command === '--import-data') {
    await importUserData();
    await importClassData();
    await importJoinedClassInfoData();
    
    process.exit();
  }
  else if (command === '--delete-data') {
    await deleteUserData();
    await deleteClassData();
    await deleteJoinedClassInfoData();

    process.exit();
  }
  else {
    console.log('Invalid command');
  }
}

execute(process.argv[2] as string);
