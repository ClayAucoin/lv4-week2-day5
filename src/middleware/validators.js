// src/middleware/validators.js

import { sendError } from "../utils/sendError.js"


export function requireBody(req, res, next) {

  if (!req.body || Object.keys(req.body).length === 0) {
    return next(sendError(
      400,
      "Request body is required",
      "MISSING_BODY"
    ))
  }
  next()
}

export function validateId(req, res, next) {
  const id = req.params.id

  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidV4Regex.test(id)) {
    return next(sendError(
      422,
      `'id', invalid format`,
      "INVALID_ID",
      { field: "id", value: id }
    ))
  }

  next()
}

export function validateItemBody(req, res, next) {

  const { imdb_id, title, year } = req.body

  const missing = []
  if (!imdb_id) missing.push("imdb_id")
  if (!title) missing.push("title")
  if (!year) missing.push("year")

  if (missing.length > 0) {
    return next(sendError(
      422,
      "Missing required fields",
      "VALIDATION_ERROR",
      { missing }
    ))
  }

  const imdbidFormat = /^tt\d{7,}$/
  if (!imdbidFormat.test(imdb_id)) {
    return next(sendError(
      422,
      `'imdb_id', invalid format`,
      "INVALID_IMDB_ID",
      { field: "imdb_id", value: imdb_id }
    ))
  }

  // year must be number
  if (typeof year !== "number") {
    return next(sendError(
      422,
      `'year' must be a number`,
      "INVALID_TYPE",
      { field: "year", value: year }
    ))
  }

  // year > 1900
  if (year < 1900) {
    return next(sendError(
      422,
      `'year' must be greater than 1900`,
      "INVALID_VALUE",
      { field: "year", value: year }
    ))
  }

  next()
}

export function validateAllowedFields(req, res, next) {

  // required fields
  const allowedFields = [
    "imdb_id",
    "title",
    "year",
    "runtime",
    "rating",
    "poster",
    "genres"
  ]
  const incomingFields = Object.keys(req.body)

  // check for extra fields
  const extraFields = incomingFields.filter(field => !allowedFields.includes(field))

  if (extraFields.length > 0) {
    return next(sendError(
      422,
      "Unexpected fields provided",
      "EXTRA_FIELDS",
      { extra: extraFields }
    ))
  }

  next()
}

// const allowedFields = ["imdb_id", "title", "year", "runtime", "rating", "poster", "genres"]
// function pickAllowedFields(body) {
//   const clean = {}
//   for (const key of allowedFields) {
//     if (body[key] !== undefined) {
//       clean[key] = body[key]
//     }
//   }
//   return clean
// }

// export function requireField(fieldName) {
//   return function (req, res, next) {
//     if (req.body[fieldName] === undefined) {
//       return next(
//         sendError(
//           422,
//           `'${fieldName}' is required`,
//           "MISSING_FIELD",
//           { field: fieldName }
//         )
//       )
//     }
//     next()
//   }
// }