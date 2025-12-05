// src/routes/add.js

import express from "express"
import { sendError } from "../utils/sendError.js"
import { requireBody, validateAllowedFields, validateItemBody } from "../middleware/validators.js"
import supabase from "../utils/supabase.js"

const router = express.Router()

// add item
router.post("/",
  requireBody,
  validateItemBody,
  validateAllowedFields,
  async (req, res, next) => {
    const newItem = req.body
    console.log("POST /items", newItem)

    const { data, error } = await supabase
      .from("movies_simple")
      .insert(newItem)
      .select()
      .maybeSingle()

    if (error) {
      return next(sendError(
        500,
        "Failed to add item",
        "INSERT_ERROR",
        { underlying: error.message }
      ))
    }

    res.status(201).json({
      ok: true,
      records: 1,
      message: "Item added successfully",
      data: data
    })
  })

export default router