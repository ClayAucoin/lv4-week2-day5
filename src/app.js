// src/app.js

import express from "express"
import supabase from "./utils/supabase.js"
import { requireBody, validateId, validateItemBody, validateAllowedFields } from "./middleware/validators.js"

const app = express()
app.use(express.json())

// get all items
app.get("/items", async (req, res, next) => {
  const { data, error } = await supabase
    .from("movies_simple_test")
    // .from("movies_simple")
    .select()

  if (error) {
    return next(sendError(
      500,
      "Failed to read data",
      "READ_ERROR",
      { underlying: error.message }
    ))
  }

  const records = data.length
  console.log(`GET /items ${records} records`)

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

// add item
app.post("/items",
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


export default app