// src/routes/del.js

import express from "express"
import { sendError } from "../utils/sendError.js";
import { validateId } from "../middleware/validators.js";
import supabase from "../utils/supabase.js"

const router = express.Router()

// delete item by id
router.delete("/:id", validateId, async (req, res, next) => {
  const id = req.params.id
  console.log(`DELETE /items/${id}`)

  const { data, error } = await supabase
    .from("movies_simple")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) {
    return next(sendError(
      500,
      "Error deleting item",
      "DELETE_ERROR",
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
    of: true,
    records: 1,
    message: "Item deleted successfully",
    data: data
  })
})

export default router