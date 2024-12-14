const pool = require("../db");

/**
 * Fetch all cities.
 */
const getAllCities = async (req, res) => {
  try {
    const query = "SELECT * FROM City ORDER BY Name ASC;";
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cities found.",
      });
    }

    res.status(200).json({
      success: true,
      cities: result.rows,
    });
  } catch (error) {
    console.error("Error fetching cities:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getAllCities,
};
