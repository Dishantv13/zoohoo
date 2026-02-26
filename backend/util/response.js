const successResponse = (res, data = null, statusCode, message) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        message
    });
}

export {
    successResponse,
    errorResponse
}