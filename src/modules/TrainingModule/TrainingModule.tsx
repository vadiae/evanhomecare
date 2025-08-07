import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { TrainingLinks } from "~/components/TrainingLinks/TrainingLinks";
import { trainings } from "~/data/trainingData";

export interface Training {
    id: string;
    title: string;
    description?: string;
    url: string;
    image_url: string;
    category: string;
    duration?: string;
}

const categories = ["All", ...new Set(trainings.map((t) => t.category))];

export function TrainingModule({
    user,
}: {
    user: { email: string; name: string } | null;
}) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTrainings = trainings.filter(
        (t) =>
            (selectedCategory === "All" || t.category === selectedCategory) &&
            (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())),
    );

    // Function to log video interaction
    const logVideoInteraction = async (training: Training) => {
        if (!user) return;

        try {
            await fetch("/api/enter_training_video", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    videoId: training.id,
                    videoTitle: training.title,
                }),
            });
        } catch (error) {
            console.error("Failed to log training video interaction:", error);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="mx-auto max-w-[1920px]">
                <div className="mb-10">
                    <div className="relative flex flex-col items-center justify-between gap-8 rounded-xl bg-gradient-to-br from-transparent via-primary/5 to-transparent p-8 sm:mt-4 sm:flex-row lg:mt-0">
                        <div className="relative hidden md:block">
                            <Image
                                width={150}
                                height={150}
                                src="/logo.webp"
                                alt="Evan Home Care Logo"
                                className="relative z-10 h-24 w-24 transform transition-transform duration-300 hover:scale-105 sm:h-32 sm:w-32"
                            />
                        </div>

                        <div className="text-center sm:text-left">
                            <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-center text-2xl font-bold uppercase text-transparent sm:text-2xl sm:text-5xl">
                                Training
                            </h1>
                            <div className="mx-auto mt-2 h-1 w-20 rounded bg-gradient-to-r from-primary/30 to-primary/20 sm:w-32"></div>
                            <p className="mt-4 text-xl text-gray-600">
                                Master our platform with step-by-step video
                                guides
                            </p>
                        </div>

                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    {user.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-10 lg:flex-row">
                    <div className="w-full lg:w-2/3">
                        <div className="mb-8 flex flex-col gap-4">
                            <input
                                type="search"
                                placeholder="Search training videos..."
                                className="w-full rounded-lg border border-gray-300 px-6 py-3 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            setSelectedCategory(category)
                                        }
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                            selectedCategory === category
                                                ? "bg-primary text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {category}{" "}
                                        <span className="text-xs opacity-75">
                                            (
                                            {
                                                trainings.filter((t) =>
                                                    category === "All"
                                                        ? true
                                                        : t.category ===
                                                          category,
                                                ).length
                                            }
                                            )
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredTrainings.length === 0 ? (
                            <div className="flex h-64 items-center justify-center rounded-lg bg-white">
                                <p className="text-lg text-gray-500">
                                    No training videos found. Try adjusting your
                                    search or category filter.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredTrainings.map((training) => (
                                    <motion.div
                                        key={training.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="h-full"
                                    >
                                        <button
                                            onClick={() => {
                                                setSelectedTraining(training);
                                                void logVideoInteraction(
                                                    training,
                                                );
                                            }}
                                            className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                                        >
                                            <div className="relative">
                                                <div className="aspect-video w-full bg-gray-100">
                                                    <Image
                                                        src={`${training.image_url}`}
                                                        alt={training.title}
                                                        className="h-full w-full object-cover"
                                                        width={640}
                                                        height={360}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/50">
                                                        <FaPlayCircle className="h-12 w-12 text-white/90" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex h-full flex-col p-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                                        {training.category}
                                                    </span>
                                                    {training.duration && (
                                                        <span className="text-sm text-gray-500">
                                                            •{" "}
                                                            {training.duration}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mb-2 text-left text-lg font-semibold">
                                                    {training.title}
                                                </h3>
                                                <p className="text-left text-sm text-gray-600">
                                                    {training.description}
                                                </p>
                                            </div>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-1/3">
                        <TrainingLinks />
                    </div>
                </div>

                <AnimatePresence>
                    {selectedTraining && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setSelectedTraining(null);
                                }
                            }}
                        >
                            <div className="relative w-full max-w-4xl rounded-lg bg-white p-4">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                    <video
                                        src={selectedTraining.url}
                                        title={selectedTraining.title}
                                        autoPlay
                                        controls
                                        className="h-full w-full"
                                        onKeyDown={(e) => {
                                            if (e.key === "Escape") {
                                                setSelectedTraining(null);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {selectedTraining.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {selectedTraining.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setSelectedTraining(null)
                                        }
                                        className="rounded-full p-2 hover:bg-gray-100"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default TrainingModule;
