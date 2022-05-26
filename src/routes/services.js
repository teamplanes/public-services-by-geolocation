const express = require("express");
const auth = require("../utils/auth");
const AppError = require("../lib/Error");
const db = require("../utils/db");

const servicesRouter = express.Router();

servicesRouter.get("/register", auth.register);

servicesRouter.use(auth.protect);

// db.connectToServer(() => {});
servicesRouter.post("/", async (req, res, next) => {
  const { lat, long } = req.body;

  if (!lat || !long)
    return next(
      new AppError(405, "missing params", "Please provide lat and long"),
      req,
      res,
      next
    );

  const dbConnect = await db.getDb();

  const gpQuery = await dbConnect.collection("gp").find({}).toArray();

  const gp = gpQuery
    .sort(
      (a, b) =>
        distance(lat, long, a.Latitude, a.Longitude) -
        distance(lat, long, b.Latitude, b.Longitude)
    )
    .slice(0, 3);

  const hospitalsQuery = await dbConnect
    .collection("hospitals")
    .find({})
    .toArray();

  const hospitals = hospitalsQuery
    .sort(
      (a, b) =>
        distance(lat, long, a.Latitude, a.Longitude) -
        distance(lat, long, b.Latitude, b.Longitude)
    )
    .slice(0, 3);

  const pharmacyQuery = await dbConnect
    .collection("pharmacy")
    .find({})
    .toArray();
  const pharmacy = pharmacyQuery
    .sort(
      (a, b) =>
        distance(lat, long, a.Latitude, a.Longitude) -
        distance(lat, long, b.Latitude, b.Longitude)
    )
    .slice(0, 3);

  const schoolsQuery = await dbConnect.collection("schools").find({}).toArray();

  const schools = schoolsQuery
    .sort(
      (a, b) =>
        distance(lat, long, a.Latitude, a.Longitude) -
        distance(lat, long, b.Latitude, b.Longitude)
    )
    .slice(0, 3);

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

const distance = (lat1, lon1, lat2, lon2, unit = "K") => {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
};

module.exports = servicesRouter;
