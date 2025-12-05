// src/routes/find.js

import express from "express"
import { sendError } from "../utils/sendError.js"
import { validateId } from "../middleware/validators.js"
import supabase from "../utils/supabase.js"

const router = express.Router()

// get item by id
router.get("/:id",
  validateId,
  async (req, res, next) => {

    const id = req.params.id
    console.log(`GET /items/${id}`)

    const { data, error } = await supabase
      .from("movies_simple")
      .select()
      .eq("id", id)
      .maybeSingle()

    if (error) {
      return next(sendError(
        500,
        "Failed to read data",
        "READ_ERROR",
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
      data: data
    })
  })

export default router