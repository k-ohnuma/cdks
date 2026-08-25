export const getResponse = (response: unknown, statusCode?: number) => {
  return {
    statusCode: statusCode ?? 200,
    body: JSON.stringify(response),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};
