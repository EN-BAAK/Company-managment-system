const { Op } = require("sequelize");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { User } = require("../models");

const createWorker = catchAsyncErrors(async (req, res, next) => {
  const { fullName, personal_id, phone, work_type, password } = req.body;

  const user = await User.findOne({
    where: { phone },
  });

  if (user) return next(new ErrorHandler("The user already exists", 400));

  await User.create({
    fullName,
    phone,
    role: "worker",
    work_type,
    personal_id,
    password,
  });

  res.status(200).json({ succuss: true, message: "Worker added successfully" });
});

const editUser = catchAsyncErrors(async (req, res, next) => {
  const { fullName, personal_id, phone, work_type, password } = req.body;
  const userId = req.params.userId;

  const user = await User.findByPk(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (fullName) user.fullName = fullName;

  if (personal_id) user.personal_id = personal_id;

  if (work_type) user.work_type = work_type;

  if (phone) user.phone = phone;

  if (password) user.password = password;

  await user.save();

  res.status(200).json({ success: true, message: "User updated successfully" });
});

const deleteWorker = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findByPk(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role === "admin")
    return next(new ErrorHandler("Internal server error!", 500));

  await user.destroy();

  res
    .status(200)
    .json({
      success: true,
      message: "Worker deleted successfully",
      id: user.id,
    });
});

const fetchWorkers = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const offset = parseInt(req.query.offset) || 20;

  const users = await User.findAll({
    attributes: { exclude: ["password", "role", "work_type"] },
    limit: offset,
    offset: (page - 1) * offset,
    where: {
      id: { [Op.ne]: 1 },
    },
  });

  res.status(200).json({ success: true, workers: [...users] });
});
module.exports = {
  createWorker,
  editUser,
  deleteWorker,
  fetchWorkers,
};
