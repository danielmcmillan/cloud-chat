export const config = {
  stage: process.env.STAGE!,
  region: process.env.REGION!,
  isOffline: Boolean(process.env.IS_OFFLINE),
  apiId: process.env.API_ID!,
  tableName: process.env.TABLE_NAME!,
};
