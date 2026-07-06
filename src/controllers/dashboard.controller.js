import { getDashboard } from "../services/dashboard.service.js";

/**
 * Get Dashboard
 */
export const getDashboardData = async (req, res) => {
  try {
    const { platform } = req.params;

    const dashboard = await getDashboard(
      req.user.id,
      platform.toLowerCase()
    );

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};