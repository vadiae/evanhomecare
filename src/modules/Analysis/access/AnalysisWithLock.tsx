"use client";

import { Button, Card, Input } from "@heroui/react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { z } from "zod";
import Spinner from "~/components/Spinner/Spinner";
import AnalysisSection from "../sections/AnalysisSection";
import { IoAnalytics } from "react-icons/io5";

const schema = z.object({
    password: z.string().min(1),
});

export function AnalysisWithLock() {
    const [values, setValues] = React.useState({
        password: "",
    });
    const [errors, setErrors] = React.useState({
        password: "",
    });
    const [isLocked, setIsLocked] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<{
        email: string;
        name: string;
        role: string;
    } | null>(null);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const evaluatePassword = async () => {
        try {
            const result = schema.safeParse(values);

            if (result.success) {
                setIsLoading(true);
                try {
                    const response = await axios.post(
                        "/api/validateAnalysisAccess",
                        {
                            password: values.password,
                        },
                    );

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (response.data?.isValid) {
                        setIsLocked(false);
                        setUser(
                            response.data as {
                                email: string;
                                name: string;
                                role: string;
                            },
                        );
                    } else {
                        enqueueSnackbar("Password incorrect", {
                            variant: "error",
                        });
                    }
                } catch (error) {
                    console.error("Error validating password:", error);
                    enqueueSnackbar(
                        "Error validating password. Please try again.",
                        {
                            variant: "error",
                        },
                    );
                } finally {
                    setIsLoading(false);
                }
            } else {
                //@ts-ignore
                setErrors(result.error.formErrors.fieldErrors);
            }
        } catch (error) {
            console.error("Error validating input:", error);
            enqueueSnackbar("An unexpected error occurred. Please try again.", {
                variant: "error",
            });
        }
    };

    if (isLocked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4">
                <Card className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <div className="rounded-full bg-primary/5 p-3">
                            <IoAnalytics className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Data Analysis
                        </h1>
                        <p className="text-sm text-gray-500">
                            Contact Evan Home Care for the password to access
                            the data analysis
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                label="Password"
                                name="password"
                                value={values.password}
                                color={errors.password ? "danger" : "default"}
                                errorMessage={
                                    errors.password &&
                                    "Please enter a valid password"
                                }
                                onChange={handleValueChange}
                                onKeyDown={(e) =>
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                    e.key === "Enter" && void evaluatePassword()
                                }
                                isRequired
                                endContent={
                                    <FaLock className="text-gray-400" />
                                }
                            />
                        </div>

                        <Button
                            onPress={() => void evaluatePassword()}
                            className="w-full bg-primary text-white shadow-lg transition-transform hover:scale-[1.02]"
                            size="lg"
                            isDisabled={isLoading}
                        >
                            {isLoading ? <Spinner /> : "Access Analysis"}
                        </Button>

                        <Button
                            variant="bordered"
                            color="default"
                            className="w-full"
                            size="lg"
                            startContent={<FaArrowLeft />}
                            onPress={() => window.history.back()}
                        >
                            Go Back
                        </Button>

                        <p className="text-center text-xs text-gray-500">
                            Need help? Contact our team
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return <AnalysisSection user={user} />;
}
