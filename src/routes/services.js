const express = require("express");
const AppError = require("../lib/Error");
const db = require("../utils/db");

const servicesRouter = express.Router();

servicesRouter.post("/", async (req, res, next) => {
  const { lat, long, maxDistance } = req.body;

  if (!lat || !long)
    return next(
      new AppError(405, "missing params", "Please provide lat and long"),
      req,
      res,
      next
    );

  const dbConnect = await db.getDb();

  const maxDistanceNumber = Number(maxDistance ?? '1500');

  if (maxDistanceNumber > 10000) {
    return next(
      new AppError(405, "maxDistance cannot exceed 10km", "maxDistance cannot exceed 10km"),
      req,
      res,
      next
    );
  }

  const filter = {
    coordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lat), Number(long)],
        },
        $minDistance: 0,
        $maxDistance: maxDistanceNumber,
      },
    },
  };

  const gp = await dbConnect.collection("gp").find(filter).toArray();
  const hospitals = await dbConnect
    .collection("hospitals")
    .find(filter)
    .toArray();
  const pharmacy = await dbConnect
    .collection("pharmacy")
    .find(filter)
    .toArray();
  const schools = await dbConnect.collection("schools").find(filter).toArray();

  return res.status(200).json({
    status: "success",
    data: {
      gp,
      hospitals,
      pharmacy,
      schools,
    },
  });
});

module.exports = servicesRouter;
