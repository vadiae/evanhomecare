"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SnackbarProvider
            autoHideDuration={3000}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
        >
            <QueryClientProvider client={queryClient}>
                <HeroUIProvider>{children}</HeroUIProvider>
            </QueryClientProvider>
        </SnackbarProvider>
    );
}
