import {
  getLibraryStats,
  getLibraryItems,
  getLibraryItem,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
  publishLibraryItem,
} from "../services/library.service.js";

/**
 * Get Content Library Stats
 */
export const getStats = async (req, res) => {
  try {
    const stats = await getLibraryStats(req.user.id);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Content
 */
export const getAllItems = async (req, res) => {
  try {
    const { search, status, platform } = req.query;

    const items = await getLibraryItems(req.user.id, {
      search,
      status,
      platform,
    });

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Content
 */
export const getSingleItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await getLibraryItem(req.user.id, id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Content not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create Content
 */
export const createItem = async (req, res) => {
  try {
    const content = await createLibraryItem({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Content created successfully.",
      data: content,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Content
 */
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await updateLibraryItem(
      req.user.id,
      id,
      req.body
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Content updated successfully.",
      data: content,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Content
 */
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await deleteLibraryItem(req.user.id, id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Content deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const publishItem = async (req, res) => {
  try {
    const published = await publishLibraryItem({
      userId: req.user.id,
      file: req.file,
      body: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Content published successfully.",
      data: published,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};