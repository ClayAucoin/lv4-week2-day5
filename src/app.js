// src/app.js

import express from "express"
import supabase from "./utils/supabase.js"
import { sendError } from "./utils/sendError.js"
import { config } from "./config.js"
import { requireBody, validateId, validateItemBody, validateAllowedFields } from "./middleware/validators.js"

const app = express()
app.use(express.json())

let tableName = "movies_simple"
tableName = "movies_simple_test"

// get all items
app.get("/items", async (req, res, next) => {
  const { data, error } = await supabase
    .from(tableName)
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

// get item by id
app.get("/items/:id",
  validateId,
  async (req, res, next) => {

    const id = req.params.id

    const { data, error } = await supabase
      .from(tableName)
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

    console.log("GET /items/id", id)
    res.status(200).json({
      ok: true,
      records: 1,
      data: data
    })
  })


// check for malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return next(sendError(400, "Invalid JSON body", "INVALID_JSON"))
  }
  next(err)
})

export function globalErrorHandler(err, req, res, next) {

  if (config.nodeEnv !== "test") {
    // console.log("stack:", err.stack || err)
  }

  const status = err.status || 500
  const message = err.message || "Internal Server error"
  const code = err.code || "INTERNAL_ERROR"

  const payload = {
    ok: false,
    error: {
      status,
      message,
      code
    }
  }

  if (err.details) {
    payload.error.details = err.details
  }

  res.status(status).json(payload)
}

export function error404(req, res, next) {
  next(sendError(
    404,
    "Route not found",
    "NOT_FOUND",
    { path: req.path, method: req.method }
  ))
}

// routes error 404
app.use(error404)

// global error handling
app.use(globalErrorHandler)


export default app