export const calculateNetPrice = (
  dealerDiscount,
  List_Price,
  isAkeneo_NetCost_Discount,
  Net_Cost,
  TotalAdditionalFeePercentage,
  TotalAdditionalFeePrice,
  vendorRulePrice,
  vendorRulePrice_Percentage,
  isVendorRules,
  minimumMargin,
  AdditionalFee,
  Shipping_Method,
  Shipping_Weight,
  shippingRules
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

  const calculateRebate = (netCost, rebate) => {
    // Calculate the rebate
    // Replace with your actual calculation logic
    const rebateAmount = (rebate / 100) * netCost;
    return rebateAmount;
  };

  const dealerDiscountData = calculatePrice(dealerDiscount, List_Price);

  let rebateArg =
    isAkeneo_NetCost_Discount === "true"
      ? Net_Cost === ""
        ? 0
        : Net_Cost
      : dealerDiscountData;

  let CalculatePercentAdditional = calculateRebate(
    rebateArg,
    TotalAdditionalFeePercentage
  );

  let TotalAdditional = (
    parseFloat(TotalAdditionalFeePrice) + parseFloat(CalculatePercentAdditional)
  ).toString();
  let result = TotalAdditional;

  let totalShiping =
    vendorRulePrice !== ""
      ? vendorRulePrice
      : vendorRulePrice_Percentage !== ""
      ? calculateRebate(rebateArg, vendorRulePrice_Percentage)
      : "";

  //////////////////////If the isVendorRules is false then the Freight shipping rules applied
  let freightClassesString = "";
  if (isVendorRules === "false") {
    // Convert the Shipping_Weight to a number
    let totalShippingPrice = 0;
    let freightClasses = []; // Array to store freight class values
    const weight = parseFloat(Shipping_Weight);
    shippingRules.forEach((rule) => {
      const weightFrom = parseFloat(rule.weightFrom);
      const weightTo = parseFloat(rule.weightTo);

      if (weight >= weightFrom && weight <= weightTo) {
        const price = parseFloat(rule.shippingCost); // Replace 'price' with the actual property name in your shipping rule object
        totalShippingPrice += price;
        freightClasses.push(rule.freightClass);
      }
    });

    if (totalShippingPrice) {
      totalShiping = totalShippingPrice;
    } else {
      totalShiping = 0;
    }
    freightClassesString = freightClasses.join(", ");
  }

  let totalCost =
    parseFloat(rebateArg) +
    parseFloat(totalShiping) +
    parseFloat(TotalAdditional);

  let sellingPrice = totalCost / (1 - minimumMargin / 100);
  let marginProfit = ((sellingPrice - totalCost) / sellingPrice) * 100;

  const updatedAdditionalFees = AdditionalFee.map((fee) => {
    if (fee.percentage) {
      return {
        ...fee,
        calculatedPriceFromNetCost: calculateRebate(rebateArg, fee.percentage),
      };
    } else {
      return {
        ...fee,
        calculatedPriceFromNetCost: "",
      };
    }
  });

  return {
    result,
    totalShiping,
    totalCost,
    sellingPrice,
    marginProfit,
    updatedAdditionalFees,
    rebateArg,
    freightClassesString,
  };
};
