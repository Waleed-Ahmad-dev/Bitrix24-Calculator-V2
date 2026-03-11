import type { Request, Response } from "express";
import { b24 } from "../Auth/bitrix24AuthUtil.js";
import { logger } from "../Utils/logger.js";

export const getListProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const client = b24.instance;
  const propertyId = req.body.propertyId;

  if (!propertyId) {
    res.status(400).json({ message: "Property ID is required" });
    return;
  }

  const propertiesResponse = await client.actions.v2.call.make({
    method: "catalog.productPropertyEnum.list",
    params: { filter: { propertyId: propertyId } },
    idKey: "ID",
    requestId: `list-${Date.now()}`,
  });


  if(!propertiesResponse.isSuccess){
    logger.error("Failed to fetch properties from Bitrix24", { error: propertiesResponse.getErrorMessages() });
    res.status(500).json({ message: "Failed to fetch properties" });
    return;
  }


  const propertiesData = propertiesResponse.getData()?.result || [];

  logger.info("Fetched properties from Bitrix24", { propertiesData });
  res.status(200).json({ properties: propertiesData });
};
