const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  if (featured) queryObject.featured = featured === "true" ? true : false;
  if (company) queryObject.company = company;
  if (name) queryObject.name = { $regex: name, $options: "i" };

  let result = Product.find(queryObject);

  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  // fields
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  // Numeric Filters
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "<": "$lt",
      "<=": "$lte",
      "=": "$eq",
    };
    const regExp = /\b(<|>|<=|>=|=)\b/g;
    let filters = numericFilters.replace(
      regExp,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters.split(",").forEach((item) => {
      const [field, op, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [op]: Number(value) };
      }
    });
  }

  // pages
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result.skip(skip).limit(limit);

  const products = await result;
  res.status(200).json({ nbHits: products.length, products });
};
