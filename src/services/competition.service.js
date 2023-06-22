const ApiError = require("../utils/ApiError");
const { Competition } = require("../models");
const createCompetition = async ({ name, website }) => {
  const compete = await Competition.create({
    name,
    website,
  });
  return {
    status: 201,
    data: compete,
  };
};

const updateCompetition = async (id, updatedFields) => {
  try {
    const competitionData = await Competition.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true, // Return the updated rule
      }
    );

    if (!competitionData) {
      throw new ApiError("comptition not found", 404);
    }

    return {
      status: 200,
      data: competitionData,
    };
  } catch (error) {
    throw new ApiError("Failed to update competition", 500);
  }
};


const deleteCompetition = async (id) => {
  try {
    const data = await Competition.findByIdAndDelete(id);
    if (!data) {
      throw new ApiError("data not found", 404);
    }
    return;
  } catch (error) {
    throw new ApiError("Failed to delete data", 500);
  }
};

module.exports = {
  createCompetition,
  updateCompetition,
  deleteCompetition,
};
