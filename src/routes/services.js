const express = require("express");
const auth = require("../utils/auth");
const AppError = require("../lib/Error");
const db = require("../utils/db");

const servicesRouter = express.Router();

servicesRouter.get("/register", auth.register);

servicesRouter.use(auth.protect);

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

  const filter = {
    coordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lat), Number(long)],
        },
        $minDistance: 0,
        $maxDistance: Number(maxDistance) ?? 1500,
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
