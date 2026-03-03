const successResponse = (
  res,
  data = null,
  statusCode = 200,
  message = "Success",
  pagination = null,
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export { successResponse, errorResponse };
