import { callBX24Method } from "./callBX24Method.js";

export const fetchReadableText = async (propertyId) => {
  // console.log(`[fetchReadableText] Fetching readable text for Property ID: ${propertyId}`);

  // try{
  //  const value =  await callBX24Method("catalog.productPropertyEnum.get", { id: propertyId })

  //  console.log(`[fetchReadableText] Received value from BX24:`, value);

  //  return value.productPropertyEnum.value;
  // }
  // catch(error){
  //     console.error("Error fetching readable text:", error);
  //     return null;
  // }

  try {
    const response = await fetch(
      "https://calcenchancev2.premierchoiceint.online/readable-text-of-properties",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: 381,
        }),
      },
    );

    const data = await response.json();

    const enums = data.enumData.productPropertyEnum || null;

    return enums;
  } catch (error) {
    console.error("Error fetching readable text:", error);
    return null;
  }
};
