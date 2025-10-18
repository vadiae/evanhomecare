import { type JsonData, type ProcessedData } from "./types";

export const processJsonData = async (
    jsonData: JsonData,
): Promise<ProcessedData> => {
    try {
        const headers = jsonData.headers;
        const rows = jsonData.rows;
        const startDate = jsonData.extractionInfo.startDate || "";
        const endDate = jsonData.extractionInfo.endDate || "";
        const distinctConsumerNames = jsonData.consumerNames || [];

        return {
            headers,
            rows,
            distinctConsumerNames,
            startDate,
            endDate,
        };
    } catch (error) {
        console.error("Error processing JSON data:", error);
        throw new Error(
            "Error processing JSON data: " + (error as Error).message,
        );
    }
};

export const handleFileUpload = async (file: File): Promise<ProcessedData> => {
    try {
        const text = await file.text();
        const jsonData: JsonData = JSON.parse(text);
        return await processJsonData(jsonData);
    } catch (error) {
        throw new Error("Error loading JSON file: " + (error as Error).message);
    }
};
