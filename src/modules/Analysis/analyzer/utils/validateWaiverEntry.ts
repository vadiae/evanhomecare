import { DataRow } from "../types";
import { validAssociatedServices, validDocumentationTypes } from "../constants";

export function validateWaiverEntry(row: DataRow): {
    isValid: boolean;
    errors: string[];
} {
    if (row["Service Code"] === "0000-WVR") {
        const associatedService = row["Associated Service"];
        const documentationType = row["Documentation Type"];

        const isValidService = validAssociatedServices.includes(
            associatedService || "",
        );
        const isValidDocType = validDocumentationTypes.includes(
            documentationType || "",
        );

        return {
            isValid: isValidService && isValidDocType,
            errors: [
                !isValidService &&
                    `Invalid Associated Service: ${associatedService}`,
                !isValidDocType &&
                    `Invalid Documentation Type: ${documentationType}`,
            ].filter((error): error is string => Boolean(error)),
        };
    }

    return { isValid: true, errors: [] };
}
