import { callBX24Method } from "./callBX24Method.js";

export const getTheProductData = async (productId) => {
  //     try {
  //         const productData = await callBX24Method('crm.product.get', { id: productId });
  //         return productData;
  //     }
  //     catch (error) {
  //         console.error("Error fetching product data:", error);
  //         return null;
  //     }

  try {

    const response = await fetch(
      "https://calcenchancev2.premierchoiceint.online/product",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
        }),
      },
    );

    if (!response.ok) {
        throw new Error("Error while fetching the product data")
    }

    const data = await response.json();

    return data.product || null;

  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
};
