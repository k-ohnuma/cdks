export const getResponse = (response: Record<string, any>, statusCode?: number) => {
  return {
    statusCode: statusCode ?? 200,
    body: JSON.stringify(response),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};
