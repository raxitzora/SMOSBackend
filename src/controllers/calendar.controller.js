import {
  getMonthlyCalendar,
  getDayCalendar,
  getUpcomingPosts,
} from "../services/calendar.service.js";

/**
 * Get Monthly Calendar
 */
export const getCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required.",
      });
    }

    const data = await getMonthlyCalendar(
      req.user.id,
      Number(year),
      Number(month)
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Calendar For Single Day
 */
export const getDay = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required.",
      });
    }

    const data = await getDayCalendar(req.user.id, date);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Upcoming Posts
 */
export const getUpcoming = async (req, res) => {
  try {
    const { limit } = req.query;

    const data = await getUpcomingPosts(
      req.user.id,
      Number(limit) || 10
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};