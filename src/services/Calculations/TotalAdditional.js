export const totalAdd = (data) => {
  const feeNames = data?.AdditionalFee?.map((item) => item.feeName);
  const feeNamesString = feeNames?.join(", ");

  const feePrices = data?.AdditionalFee?.map((item) => item.price).filter(
    (price) => price !== ""
  );

  const feeCal = data?.AdditionalFee?.map(
    (item) => item.calculatedPriceFromNetCost
  ).filter((calculatedPriceFromNetCost) => calculatedPriceFromNetCost !== "");

  const feePricesString = feePrices?.join(", ");
  const feeCalString = feeCal?.join(", ");
  const combinedString = [feePricesString, feeCalString]
    .filter(Boolean)
    .join(", ");

  const prices = combinedString
    .split(",")
    .map((price) => parseFloat(price.trim()));

  // Calculate the total of all prices
  const total = prices.reduce((sum, price) => sum + price, 0);

  return total;
};
