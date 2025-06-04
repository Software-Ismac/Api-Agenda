const handleError = (c: any, statusCode: number, message: string) => {
  c.status(statusCode);
  return c.json({
    status: false,
    message,
  });
};
export { handleError };
