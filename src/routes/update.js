// src/routes/update.js

import express from "express"
import { sendError } from "../utils/sendError.js"
import { requireBody, validateAllowedFields, validateId, validateItemBody } from "../middleware/validators.js"
import supabase from "../utils/supabase.js"

const router = express.Router()

// update item by id
router.put("/:id",
  requireBody,
  validateId,
  validateAllowedFields,
  validateItemBody,
  async (req, res, next) => {
    const id = req.params.id
    const updateItem = req.body
    console.log(`PUT /items/${id}`)

    const { data, error } = await supabase
      .from("movies_simple")
      .update(updateItem)
      .eq("id", id)
      .select()
      .maybeSingle()

    if (error) {
      return next(sendError(
        500,
        "Failed to update item",
        "UPDATE_ERROR",
        { underlying: error.message }
      ))
    }

    if (!data) {
      return next(sendError(
        404,
        "Item not found",
        "NOT_FOUND",
        { path: req.path, method: req.method }
      ))
    }

    res.status(200).json({
      ok: true,
      records: 1,
      message: "Item updated successfully",
      data: data
    })
  })

export default router