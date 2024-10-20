export const paginationResult = (
  records: any[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
