import React from "react";
import { ConsumerAnalysisResult } from "../../analyzer/types";

interface WaiverValidationErrorsProps {
    consumerResult: ConsumerAnalysisResult;
}

export const WaiverValidationErrors: React.FC<WaiverValidationErrorsProps> = ({
    consumerResult,
}) => {
    if (Object.keys(consumerResult.analysis.waiverValidation).length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="mb-2 w-max rounded-md bg-primary px-2 text-lg font-semibold text-white">
                <h6 className="">Waiver Entry Validation Errors</h6>
            </div>

            {Object.entries(consumerResult.analysis.waiverValidation).map(
                ([index, validation]) => (
                    <div key={index} className="mb-2 text-red-600">
                        {validation.errors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </div>
                ),
            )}
        </div>
    );
};
