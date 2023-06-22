export const calculateMapPrice = (
  Dealer_MapPrice,
  List_Price,
  isAkeneo_MapDiscount,
  MAP_Price,
  minimumMargin,
  netPriceResult
) => {
  const calculatePrice = (value, price) => {
    // Calculate the price with discount
    // Replace with your actual calculation logic
    const discounts = value.split("/");
    let newPrice = price;
    discounts.forEach((discount) => {
      const discountPercentage = Number(discount);
      const discountPrice = newPrice * (discountPercentage / 100);
      newPrice -= discountPrice;
    });
    return newPrice;
  };

  const map_price__discount = calculatePrice(Dealer_MapPrice, List_Price);

  let mapPrice =
    isAkeneo_MapDiscount === "true" ? MAP_Price : map_price__discount;

  const numericTotalCost = parseFloat(netPriceResult.totalCost);
  let updatedNetPriceResult = { ...netPriceResult }; // Create a copy of netPriceResult

  if (MAP_Price === "true") {
    if (mapPrice) {
      const numericMapPrice = parseFloat(mapPrice);

      const mapMargin =
        ((numericMapPrice - numericTotalCost) / numericMapPrice) * 100;

      if (mapMargin >= 0 && mapMargin < minimumMargin) {
        updatedNetPriceResult.sellingPrice =
          numericTotalCost / (1 - minimumMargin / 100);
      } else {
        updatedNetPriceResult.sellingPrice = numericMapPrice;
        updatedNetPriceResult.marginProfit = Math.max(mapMargin, minimumMargin);
      }
    }
  } else {
    updatedNetPriceResult.sellingPrice =
      numericTotalCost / (1 - minimumMargin / 100);
    updatedNetPriceResult.marginProfit = minimumMargin;
  }

  return {
    marginProfit: updatedNetPriceResult.marginProfit,
    sellingPrice: updatedNetPriceResult.sellingPrice,
  };
};
