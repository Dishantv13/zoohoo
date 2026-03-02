import { dashboardServices } from "../service/report.services.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";

const dashboardController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await dashboardServices(req.user._id, {
    startDate,
    endDate,
  });

  return successResponse(
    res,
    data,
    200,
    "Dashboard data retrieved successfully",
  );
});

export { dashboardController };
