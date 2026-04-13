const asyncHandler = require("express-async-handler");

const Ticket = require("../models/Ticket");
const { apiSuccess } = require("../utils/apiResponse");

const adminStats = asyncHandler(async (req, res) => {
  const [byStatus, byPriority, byCategory] = await Promise.all([
    Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, count: 1, name: "$category.name" } },
    ]),
  ]);

  return apiSuccess(res, {
    data: { byStatus, byPriority, byCategory },
    message: "Stats fetched",
  });
});

module.exports = { adminStats };

