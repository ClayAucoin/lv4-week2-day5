// src/routes/read.js

import express from "express"
import { sendError } from "../utils/sendError.js"
import supabase from "../utils/supabase.js"

const router = express.Router()

// get all items
router.get("/", async (req, res, next) => {
  const { data, error } = await supabase
    .from("movies_simple")
    .select()
    .order("title")

  const records = data.length
  console.log(`GET /items ${records} records`)

  if (error) {
    return next(sendError(
      500,
      "Failed to read data",
      "READ_ERROR",
      { underlying: error.message }
    ))
  }

  if (records === 0) {
    return res.status(404).json({
      ok: true,
      message: "No items found",
      data: data
    })
  }

  res.status(200).json({
    ok: true,
    records: records,
    data: data
  })
})

export default router