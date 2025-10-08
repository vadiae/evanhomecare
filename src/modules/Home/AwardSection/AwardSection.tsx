"use client";

import Image from "next/image";

export function AwardSection() {
    return (
        <section className="w-full py-12 sm:py-14">
            <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6">
                <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 md:flex-row-reverse md:gap-10 md:p-10">
                    <a
                        href="/award.jpeg"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open award image in new tab"
                        className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-primary/30 shadow-sm sm:h-44 sm:w-44 md:h-48 md:w-48"
                    >
                        <Image
                            src="/award.jpeg"
                            alt="Award recognition"
                            fill
                            sizes="(max-width: 768px) 176px, (max-width: 1024px) 192px, 208px"
                            className="object-cover"
                            priority
                        />
                    </a>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="text-xl font-semibold text-primary sm:text-2xl">
                            Recognized for Excellence in Home Care
                        </h3>
                        <p className="mt-2 text-sm text-gray-700 sm:text-base">
                            We are honored to be acknowledged for our commitment
                            to quality, compassion, and community service. Thank
                            you for trusting Evan Home Care.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AwardSection;
