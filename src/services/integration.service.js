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
const updateStatus = async ({ status, clientId }) => {
  // Find the record with the provided clientId
  const foundRecord = await Intergration.findOne({ clientId });

  if (!foundRecord) {
    // Handle case when the record is not found
    return {
      status: 404,
      message: "Integration record not found.",
    };
  }

  // Update the status of the found record to the desired status
  foundRecord.status = status;
  await foundRecord.save();

  // Set the status of all other records to false
  await Intergration.updateMany(
    { clientId: { $ne: clientId } },
    { $set: { status: false } }
  );

  return {
    status: 201,
    data: foundRecord,
  };
};

const updateIntegration = async ({
  userName,
  password,
  secret,
  clientId,
  domain,
  integrationId,
}) => {
  try {
    const existingIntegration = await Intergration.findById(integrationId);

    if (!existingIntegration) {
      return {
        error: true,
        message: "Integration not found.",
      };
    }

    existingIntegration.userName = userName;
    existingIntegration.password = password;
    existingIntegration.secret = secret;
    existingIntegration.clientId = clientId;
    existingIntegration.domain = domain;

    const updatedIntegration = await existingIntegration.save();

    return {
      status: 200,
      data: updatedIntegration,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error updating integration.",
    };
  }
};

const deleteIntegration = async (integrationId) => {
  try {
    const existingIntegration = await Intergration.findByIdAndDelete(
      integrationId
    );

    if (!existingIntegration) {
      return {
        error: true,
        message: "Integration not found.",
      };
    }

    return {
      status: 200,
      message: "Integration deleted successfully.",
    };
  } catch (error) {
    return {
      error: true,
      message: "Error deleting integration.",
    };
  }
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
  updateStatus,
  updateIntegration,
  deleteIntegration,
};
