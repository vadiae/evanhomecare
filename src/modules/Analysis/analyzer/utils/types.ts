import { type ConsumerAnalysisResult, type DataRow } from "../types";

export interface JsonData {
    extractionInfo: {
        startDate: string;
        endDate: string;
    };
    headers: string[];
    rows: any[][];
    consumerNames?: string[];
    reportDate?: string;
    recordsAmount?: number;
    startDate?: string;
    endDate?: string;
    failedCustomerNames?: string[];
}

export interface ClientSchedule {
    id: number;
    clientId: string;
    clientName: string;
    startDate: string;
    endDate: string;
    service: string;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
    sunday: number | null;
    multiple: boolean | null;
    createdAt: string;
}

export interface ProcessedData {
    headers: string[];
    rows: any[][];
    distinctConsumerNames: string[];
    startDate: string;
    endDate: string;
    failedCustomerNames: string[];
}

export type { ConsumerAnalysisResult, DataRow };
