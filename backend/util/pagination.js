const getPagination = (options = {}) => {
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNext: totalPages > 0 && page < totalPages,
    hasPrev: page > 1 && totalPages > 0,
  };
};

export { getPagination, getPaginationMeta };
