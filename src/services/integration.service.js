const { Intergration } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a Reule
 * @param { Object } contactBody
 * @returns {Promise<Intergration>}
 * @throws {ApiError}
 */
const createIntegration = async ({ userName, password, secret, clientId }) => {
  const data = await Intergration.create({
    userName,
    password,
    secret,
    clientId,
  });
  return {
    status: 201,
    data: data,
  };
};

/**
 * Get Integration Data
 * @returns {Promise<Intergration[]>}
 */
const getIntegrationData = async () => {
  const data = await Intergration.find();
  return data;
};

module.exports = {
  createIntegration,
  getIntegrationData,
};
