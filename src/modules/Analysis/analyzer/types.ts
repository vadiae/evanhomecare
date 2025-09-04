export interface DataRow {
    consumerName?: string;
    serviceCode?: string;
    associatedService?: string;
    documentationType?: string;
    units?: string;
    date?: string;
    "Service Code"?: string;
    "Associated Service"?: string;
    "Documentation Type"?: string;
    Units?: string;
    Date?: string;
    [key: string]: any;
}

export interface AnalysisResult {
    filteredData: {
        rows: DataRow[];
        columns?: string[];
        rowCount?: number;
        startDate?: string;
        endDate?: string;
    };
    groupedByService: Record<string, DataRow[]>;
    totalServiceGrouped: Record<string, number>;
    groupedByDay: Record<
        string,
        Record<
            string,
            {
                entries: DataRow[];
                warning: boolean;
                totalUnits: number;
            }
        >
    >;
    waiverValidation: Record<
        string,
        {
            isValid: boolean;
            errors: string[];
        }
    >;
    groupedByAssociatedService: Record<string, DataRow[]>;
    waiverCount: number;
}

export interface ConsumerAnalysisResult {
    consumerName: string;
    analysis: AnalysisResult;
    hasErrors: boolean;
    errorCount: number;
}
