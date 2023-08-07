export const competitionCalc = (
  netPrice,
  shippingCost,
  ourFees,
  minimumMargin,
  payload,
  isRoundDown,
  isShipping_Cost,
  Dealer_NetCost_Discount
) => {
  netPrice = parseFloat(netPrice);
  shippingCost = parseFloat(shippingCost);
  ourFees = parseFloat(ourFees);
  Dealer_NetCost_Discount = parseFloat(Dealer_NetCost_Discount);

  if (isNaN(ourFees) || !ourFees) {
    ourFees = 0;
  }

  // Calculate the total of netPrice, shippingCost, and ourFees

  let total = 0;
  if (
    (netPrice === "" || netPrice === undefined || netPrice === "0",
    netPrice === 0 || isNaN(netPrice))
  ) {
    total = Dealer_NetCost_Discount + shippingCost + ourFees;
  } else {
    total = netPrice + shippingCost + ourFees;
  }

  console.log(
    netPrice,
    shippingCost,
    ourFees,
    Dealer_NetCost_Discount,
    "-----total"
  );

  let lowestMargin = Infinity;

  payload.forEach((obj) => {
    if (!obj.isProductAvailible) {
      const price = parseFloat(obj.price);

      // Add shippingCost to price if freeShipping is true
      let adjustedPrice = obj.freeShipping
        ? price
        : parseFloat(price) + parseFloat(obj.shippingPrice);

      let margin = ((adjustedPrice - total) / adjustedPrice) * 100;

      if (isNaN(margin)) {
        margin = 0;
      }
      if (isNaN(adjustedPrice)) {
        adjustedPrice = 0;
      }

      if (!isNaN(margin) && margin > minimumMargin && margin < lowestMargin) {
        lowestMargin = margin;
      }
    } else {
      obj.result = "product not available";
    }
  });

  console.log("Lowest Margin:", lowestMargin);

  let calculatedPrice = 0;
  let calculatedMargin = 0;
  let calculatedRoundedPrice = 0;

  // Update the payload array, considering freeShipping and isProductAvailible
  const updatedPayload = payload.map((obj) => {
    if (!obj.isProductAvailible) {
      const price = parseFloat(obj.price);

      // Add shippingCost to price if freeShipping is true
      let adjustedPrice = obj.freeShipping
        ? price
        : parseFloat(price) + parseFloat(obj.shippingPrice);

      let margin = ((adjustedPrice - total) / adjustedPrice) * 100;

      if (isNaN(margin)) {
        margin = 0;
      }
      if (isNaN(adjustedPrice)) {
        adjustedPrice = 0;
      }

      let message;

      const tolerance = 0.001; // Adjust the tolerance value as needed
      const isUnderMargin =
        parseFloat(margin) < parseFloat(minimumMargin) + tolerance;

      if (
        (netPrice === "" && Dealer_NetCost_Discount === "") ||
        (netPrice === 0 && Dealer_NetCost_Discount === 0) ||
        (netPrice === "0" && Dealer_NetCost_Discount === "0") ||
        (netPrice === undefined && Dealer_NetCost_Discount === "true") ||
        (isNaN(netPrice) && Dealer_NetCost_Discount === "true") ||
        (shippingCost === "" && isShipping_Cost === "true") ||
        (shippingCost === 0 && isShipping_Cost === "true") ||
        (shippingCost === undefined && isShipping_Cost === "true") ||
        (shippingCost === "0" && isShipping_Cost === "true")
        // ourFees === "" ||
        // ourFees === "0" ||
        // ourFees === 0 ||
        // ourFees === undefined
      ) {
        margin = 0;
      } else if (isUnderMargin) {
        message = "ignore - under margin";
      } else if (parseFloat(margin) > parseFloat(lowestMargin)) {
        message = "Compete";
      } else if (parseFloat(margin) >= parseFloat(minimumMargin)) {
        message = "Compete - Lowest Price";
        calculatedMargin = margin;

        if (adjustedPrice >= 10000) {
          calculatedRoundedPrice = Math.floor(adjustedPrice / 100) * 100 - 1;
        } else if (adjustedPrice >= 1000) {
          calculatedRoundedPrice = Math.floor(adjustedPrice / 50) * 50 - 1;
        } else {
          calculatedRoundedPrice = Math.floor(adjustedPrice / 10) * 10 - 1;
        }

        calculatedPrice = adjustedPrice;
      }

      console.log(obj);

      return {
        ...obj,
        totalPrice: adjustedPrice,
        margin,
        result: message,
        compete_lowest_price: calculatedPrice,
        compete_RoundedPrice: calculatedRoundedPrice,
        lowestMargin: lowestMargin,
        minimumMargin,
        isUnderMargin,
      };
    }

    return obj; // Return the object as is if isProductAvailible is true
  });

  return {
    updatedPayload,
    calculatedPrice,
    calculatedMargin,
    calculatedRoundedPrice,
  };
};
