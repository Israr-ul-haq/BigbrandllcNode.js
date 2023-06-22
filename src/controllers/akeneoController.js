const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const https = require("https");
const { tableService } = require("@services");
const fs = require("fs");
const path = require("path");
const { resolve } = require("path");
const { page } = require("../utils/customLabels");
const { response } = require("express");
const { request } = require("http");
const { Products } = require("../models");

const domain = "akeneo.bigbrandsllc.co";
const data = JSON.stringify({
  grant_type: "password",
  client_id: "3_6dmd2zantk00cw8o0owcckc8gcgkgc048wg44gkg0ggwsgokow",
  client_secret: "1uwlu3bo4xwks4084wc4wwo0cc80g4wcok88g8o4gs8cwgggw4",
  username: "exporttoreactapp_7194",
  password: "2d0df5643",
});
const options = {
  hostname: domain,
  path: "/api/oauth/v1/token",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};
let token = null,
  token_time = null;
const generateToken = async (request, response, next) => {
  if (
    token == null ||
    (token != null && Date.now() - token_time > 3600 * 1000)
  ) {
    const req = https.request(options, (res) => {
      let response_data = "";
      res.on("data", (chunk) => {
        response_data += chunk;
      });
      res.on("end", () => {
        token = JSON.parse(response_data).access_token;
        token_time = Date.now();
        next();
      });
    });
    req.on("error", (error) => {
      response.status(httpStatus.NOT_FOUND).send("server error");
    });
    req.write(data);
    req.end();
  } else {
    next();
  }
};
const getToken = catchAsync(async (request, response) => {
  //   const categories = await categoryService.getCategories();
  const req = https.request(options, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });
    res.on("end", () => {
      token = JSON.parse(response_data).access_token;
      response.status(httpStatus.OK).send("success");
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("error");
  });
  req.write(data);
  req.end();
});
const downloadImage = (url, dst) => {
  return new Promise((resolve, reject) => {
    https.get(url, function (response) {
      response.pipe(dst);
      dst.on("finish", () => {
        resolve();
      });
      dst.on("error", (err) => {
        reject(err);
      });
    });
  });
};

const getProduct = catchAsync(async (request, response) => {
  async function getAllProducts(search, enabled, token, limit = 100) {
    const domain = "akeneo.bigbrandsllc.co";
    let page = 1;
    let totalCount = 0;
    let items = [];

    do {
      const pt = `/api/rest/v1/products?search={"identifier":[{"operator":"CONTAINS","value":"${search}","locale":"en_US"}]}&page=${page}&with_count=true&pagination_type=page&limit=${limit}`;
      let option = {
        hostname: domain,
        path: pt,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      if (enabled != undefined) {
        option.path = `/api/rest/v1/products?search={"identifier":[{"operator":"CONTAINS","value":"${search}","locale":"en_US"}],"enabled":[{"operator":"=","value":true}]}&page=${page}&with_count=true&pagination_type=page&limit=${limit}`;
      }
      console.log("Path", option.path);

      const response = await new Promise((resolve, reject) => {
        const req = https.request(option, (res) => {
          let response_data = "";
          res.on("data", (chunk) => {
            response_data += chunk;
          });
          res.on("end", () => {
            resolve(response_data);
          });
        });
        req.on("error", (err) => {
          console.error(err);
          reject(err);
        });
        req.end();
      });

      const { _embedded, items_count } = JSON.parse(response);
      totalCount = items_count;
      items = [...items, ..._embedded.items];

      console.log(`Fetched ${items.length} out of ${items_count} products`);

      page++;
    } while (items.length < totalCount);

    // Create an array of promises for downloading images
    const downloadImageAsync = (url, file) => {
      return new Promise((resolve, reject) => {
        https
          .get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          })
          .on("error", (err) => {
            fs.unlinkSync(file);
            reject(err);
          });
      });
    };

    const getPathParts = async (el) => {
      const { values } = el;
      const { Image_1 } = values;

      if (Image_1 !== undefined && Image_1 != null && Image_1.length) {
        const { data } = Image_1[0];
        const imageUrl = `https://akeneo.bigbrandsllc.co/media/cache/thumbnail_small/${data}`;
        const imageResUrl = `/media/cache/thumbnail_small/${data}`;
        const filePath = imageUrl;
        var pathParts = path.parse(filePath);

        // Download image if it doesn't exist in local storage

        // const imagePath = `./src/public/image/${pathParts?.base}`;
        // if (fs.existsSync(imagePath)) {
        //   console.log(`Image already exists for ${el?.identifier}`);
        // } else {
        //   const file = fs.createWriteStream(
        //     `./src/public/image/${pathParts?.base}`
        //   );
        //   await downloadImageAsync(imageUrl, file); // wait for image download to complete
        //   console.log(`Image downloaded for ${el?.identifier}`);
        // }
        return imageUrl; // Return the full image URL
      } else {
        return null;
      }
    };

    const existingProducts = await Products.find();

    const productsToInsert = [];
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      const pathParts = await getPathParts(el);

      const existingProduct = existingProducts.find(
        (p) => p.SKU === el.identifier
      );

      if (!existingProduct) {
        productsToInsert.push({
          image: `${pathParts}`,
          items_count: "",
          Product_Name: el?.values?.Product_Name?.[0]?.data || "",
          SKU: el?.identifier || "",
          Brand: el?.values?.Brand?.[0]?.data || "",
          Product_Type: el?.values?.Product_Type?.[0]?.data || "",
          Shipping_Method: el?.values?.Shipping_Method?.[0]?.data || "",
          Shipping_Weight: el?.values?.Shipping_Weight?.[0]?.data || "",
          Shipping_Width: el?.values?.Shipping_Width?.[0]?.data || "",
          Shipping_Depth: el?.values?.Shipping_Depth?.[0]?.data || "",
          Freight_Class: el?.values?.Freight_Class?.[0]?.data || "",
          Pricing_Category: el?.values?.Pricing_Category?.[0]?.data
            ? el?.values?.Pricing_Category?.[0]?.data
            : "Default",
          Price: 0,
          List_Price: el?.values?.List_Price?.[0]?.data?.[0]?.amount || "",
          Net_Cost: el?.values?.Net_Cost?.[0]?.data?.[0]?.amount || "",
          Dealer_NetCost_Discount: "",
          MAP_Price: el?.values?.MAP_Price?.[0]?.data?.[0]?.amount || "",
          MAP_Policy: el?.values?.MAP_Policy?.[0]?.data || "",
          Compare_at_price: el?.values?.Compare_at_price?.[0]?.data?.[0].amount,
          Free_Shipping: el?.values.Free_Shipping?.[0]?.data,
          Shipping_Cost: "",
          Dealer_MapPrice: "",
          isAkeneo_NetCost_Discount: "true",
          isAkeneo_MapDiscount: "true",
          isShipping_Cost: "false",
          Net_Cost_percentage: "",
          Map_Price_percentage: "",
          is_Quarterly_Rebate: "false",
          is_Quarterly_Volume_Based_Rebate: "false",
          Quarterly_Rebate: "",
          is_Annual_Rebate: "false",
          is_Annual_Volume_Based_Rebate: "false",
          Annual_Rebate_Percentage: "",
          AdditionalFee: [],
          isVendorRules: "false",
          vendorRulePrice: "",
          vendorRulePrice_Percentage: "",
          TotalAdditionalFee: "",
          minimumMargin: "",
        });
      } else {
        const updatedProduct = {
          ...existingProduct, // Keep the existing fields unchanged
          image: `${pathParts}`,
          Product_Name: el?.values?.Product_Name?.[0]?.data || "",
          SKU: el?.identifier || "",
          Brand: el?.values?.Brand?.[0]?.data || "",
          Product_Type: el?.values?.Product_Type?.[0]?.data || "",
          Shipping_Method: el?.values?.Shipping_Method?.[0]?.data || "",
          Shipping_Weight: el?.values?.Shipping_Weight?.[0]?.data || "",
          Shipping_Width: el?.values?.Shipping_Width?.[0]?.data || "",
          Shipping_Depth: el?.values?.Shipping_Depth?.[0]?.data || "",
          Freight_Class: el?.values?.Freight_Class?.[0]?.data || "",
          Pricing_Category: el?.values?.Pricing_Category?.[0]?.data
            ? el?.values?.Pricing_Category?.[0]?.data
            : "Default",
          List_Price: el?.values?.List_Price?.[0]?.data?.[0]?.amount || "",
          Net_Cost: el?.values?.Net_Cost?.[0]?.data?.[0]?.amount || "",
          Dealer_NetCost_Discount: "",
          MAP_Price: el?.values?.MAP_Price?.[0]?.data?.[0]?.amount || "",
          MAP_Policy: el?.values?.MAP_Policy?.[0]?.data || "",
          Compare_at_price: el?.values?.Compare_at_price?.[0]?.data?.[0].amount,
          Free_Shipping: el?.values.Free_Shipping?.[0]?.data,
        };

        productsToInsert.push(updatedProduct);
      }
    }

    // Use bulkWrite to insert all the products at once
    if (productsToInsert.length > 0) {
      await Products.bulkWrite(
        productsToInsert.map((p) => ({
          updateOne: {
            filter: { SKU: p.SKU },
            update: { $set: p },
            upsert: true,
          },
        }))
      );
      const message = `products imported sucessfully`;

      response.status(200).json({ message });
    } else {
      const message = "No new products to create or update";
      response.status(200).json({ message });
    }
  }
  getAllProducts("", false, token);
});

const addProduct = catchAsync(async (request, response) => {
  //console.log(request.body);
  const { identifier } = request.body;
  const option = {
    hostname: domain,
    path: `/api/rest/v1/products`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const data = JSON.stringify({ identifier });
  //console.log(data);
  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });
    res.on("end", async () => {
      //console.log(response_data);
      response.status(httpStatus.OK).send({ success: true });
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.write(data);
  req.end();
});

const updateProduct = catchAsync(async (request, response) => {
  const { products } = request.body;

  const updateMultipleProducts = async (products) => {
    const promises = products.map((product) => {
      const { identifier, price, compare_at_price, Free_Shipping } = product;
      const updateData = {
        values: {
          Price: [
            {
              data: [
                {
                  amount: price.toString(),
                  currency: "USD",
                },
              ],
              locale: null, // Replace with the desired locale
              scope: null, // Replace with the desired scope
            },
          ],
          Compare_at_price: [
            {
              data: [
                {
                  amount: compare_at_price.toString(),
                  currency: "USD",
                },
              ],
              locale: null, // Replace with the desired locale
              scope: null, // Replace with the desired scope
            },
          ],
          Free_Shipping: [
            {
              data: Free_Shipping,
              locale: null, // Replace with the desired locale
              scope: null, // Replace with the desired scope
            },
          ],
        },
      };

      const option = {
        hostname: domain,
        path: `/api/rest/v1/products/${encodeURIComponent(identifier)}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const data = JSON.stringify(updateData);

      return new Promise((resolve, reject) => {
        const req = https.request(option, (res) => {
          let response_data = "";
          res.on("data", (chunk) => {
            response_data += chunk;
          });

          res.on("end", () => {
            resolve(response_data);
          });
        });

        req.on("error", (error) => {
          reject(error);
        });

        req.write(data);
        req.end();
      });
    });

    try {
      const responses = await Promise.all(promises);
      return responses;
    } catch (error) {
      console.error(error);
    }
  };
  try {
    const updatedResponses = await updateMultipleProducts(products);
    response.status(200).json({ akeneoProducts: updatedResponses });
  } catch (error) {
    console.error(error);
  }
});

const getTableColumns = catchAsync(async (request, response) => {
  const tablecolumns = await tableService.getTableColumns();
  if (tablecolumns.length)
    response
      .status(httpStatus.OK)
      .send({ success: true, data: tablecolumns[0] });
  else response.status(httpStatus.NOT_FOUND).send("database not found");
});
const updateTableColumns = catchAsync(async (request, response) => {
  const tablecolums = await tableService.createTableColumn(request.body);
  response.status(httpStatus.OK).send({ success: true, data: tablecolums });
});
const getBrand = catchAsync(async (request, response) => {
  const option = {
    hostname: domain,
    path: `/api/rest/v1/attributes/Brand/options`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });
    res.on("end", async () => {
      const { _embedded } = JSON.parse(response_data);
      if (_embedded != undefined) {
        const { items } = _embedded;
        if (items != undefined)
          response.status(httpStatus.OK).send({ success: true, data: items });
        else response.status(httpStatus.NOT_FOUND).send("error");
      } else response.status(httpStatus.NOT_FOUND).send("error");
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.write(data);
  req.end();
});
const addBrand = catchAsync(async (request, response) => {
  console.log(request.body);
  const option = {
    hostname: domain,
    path: `/api/rest/v1/attributes/Brand/options`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const data = JSON.stringify(request.body);
  //console.log(data);
  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });
    res.on("end", async () => {
      //console.log(response_data);
      response.status(httpStatus.OK).send({ success: true });
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.write(data);
  req.end();
});
const getVendor = catchAsync(async (request, response) => {
  const option = {
    hostname: domain,
    path: `/api/rest/v1/attributes/Pricing_Category/options`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });
    res.on("end", async () => {
      const { _embedded } = JSON.parse(response_data);
      if (_embedded != undefined) {
        const { items } = _embedded;
        if (items != undefined)
          response.status(httpStatus.OK).send({ success: true, data: items });
        else response.status(httpStatus.NOT_FOUND).send("error");
      } else response.status(httpStatus.NOT_FOUND).send("error");
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.write(data);
  req.end();
});
const addVendor = catchAsync(async (request, response) => {
  const option = {
    hostname: domain,
    path: `/api/rest/v1/attributes/Pricing_Category/options`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const data = JSON.stringify(request.body);
  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });
    res.on("end", async () => {
      //console.log(response_data);
      response.status(httpStatus.OK).send({ success: true });
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.write(data);
  req.end();
});

const getAkneoBrands = catchAsync(async (request, response) => {
  const option = {
    hostname: domain,
    path: "/api/rest/v1/attributes/brand/options?limit=100",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });

    res.on("end", async () => {
      const { _embedded } = JSON.parse(response_data);
      let { items } = _embedded;

      if (items.length) {
        let brands = items.map((el) => ({
          id: el.code,
          label: el.labels.en_US,
        }));
        response.status(httpStatus.OK).send({ success: true, data: brands });
      } else {
        response.status(httpStatus.NOT_FOUND).send("No Brands found");
      }
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.end();
});
const getProductCategories = catchAsync(async (request, response) => {
  const option = {
    hostname: domain,
    path: "/api/rest/v1/attributes/Pricing_Category/options?limit=100",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(option, (res) => {
    let response_data = "";
    res.on("data", (chunk) => {
      response_data += chunk;
    });

    res.on("end", async () => {
      const { _embedded } = JSON.parse(response_data);
      let { items } = _embedded;

      if (items.length) {
        let brands = items.map((el) => ({
          id: el.code,
          label: el.labels.en_US,
        }));
        response.status(httpStatus.OK).send({ success: true, data: brands });
      } else {
        response.status(httpStatus.NOT_FOUND).send("No Brands found");
      }
    });
  });
  req.on("error", (error) => {
    response.status(httpStatus.NOT_FOUND).send("server error");
  });
  req.end();
});

const getAkeneoPricingCategoriesByBrand = catchAsync(async (req, res) => {
  const brandId = req.params.brandId;

  const searchQuery = `{"attribute":[{"code":"Brand","operator":"like","value":"%${brandId}%"}]}`;
  const url = `/api/rest/v1/products?search=${searchQuery}&limit=100&with_count=false`;
  const options = {
    hostname: domain,
    path: url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      console.log(data);
      console.log(JSON.parse(data)._embedded.items);
      const products = JSON.parse(data)._embedded.items;

      if (products.length) {
        const pricingCategories = products.map((product) => ({
          productId: product.identifier,
          pricingCategory: product.values.pricing_category
            ? product.values.pricing_category[0].data
            : null,
        }));
        res
          .status(httpStatus.OK)
          .send({ success: true, data: pricingCategories });
      } else {
        console.log(res.status);
        res
          .status(httpStatus.NOT_FOUND)
          .send("No products found for the specified brand");
      }
    });
  });

  request.on("error", (error) => {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Server error");
  });

  request.end();
});

module.exports = {
  getToken,
  getProduct,
  getBrand,
  addBrand,
  getVendor,
  addVendor,
  addProduct,
  updateProduct,
  generateToken,
  getTableColumns,
  updateTableColumns,
  getAkneoBrands,
  getAkeneoPricingCategoriesByBrand,
  getProductCategories,
};
