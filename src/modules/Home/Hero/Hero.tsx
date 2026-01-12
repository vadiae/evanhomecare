import Image from "next/image";
import dictionary from "~/dictionary/dictionaryLink";
import styles from "./hero.module.css";

export function HeroSection() {
    return (
        <div id="Hero">
            <div className="relative -mx-[calc((100vw-100%)/2)] py-32 ">
                <div className="absolute inset-0">
                    <svg
                        preserveAspectRatio="none"
                        viewBox="0 0 1440 240"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: "100%", height: "120px" }}
                    >
                        <path
                            fill="rgb(42, 128, 156)"
                            fillOpacity="1"
                            d="M0,48L48,40C96,32,192,16,288,40C384,64,480,128,576,160C672,192,768,192,864,196C960,200,1056,208,1152,184C1248,160,1344,104,1392,76L1440,48L1440,240L1392,240C1344,240,1248,240,1152,240C1056,240,960,240,864,240C768,240,672,240,576,240C480,240,384,240,288,240C192,240,96,240,48,240L0,240Z"
                        />
                    </svg>

                    <div className="h-[calc(100vw+50px)] w-full bg-primary sm:h-[600px] md:h-[320px] lg:h-[380px] xl:h-[430px]"></div>

                    <svg
                        preserveAspectRatio="none"
                        viewBox="0 0 1440 160"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: "100%", height: "80px" }}
                    >
                        <path
                            fill="rgb(42, 128, 156)"
                            fillOpacity="1"
                            d="M0,32L48,26.7C96,21,192,11,288,26.7C384,43,480,85,576,106.7C672,128,768,128,864,130.7C960,133,1056,139,1152,122.7C1248,107,1344,69,1392,50.7L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        />
                    </svg>
                </div>
                <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
                    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                        <div className="max-w-3xl">
                            <h1
                                className={`${styles.slogan} mb-12 text-[clamp(1.8rem,4.5vw,4rem)] font-bold leading-[1.3] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]`}
                            >
                                " Making a difference in people's lives, where
                                quality of life counts"
                            </h1>

                            <a
                                href="#Services"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/10 bg-white px-6 py-3 text-lg font-semibold text-primary transition-all hover:bg-primary-100"
                            >
                                Our Services
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </a>
                        </div>

                        <div className="w-full max-w-xl">
                            <div className="relative">
                                <Image
                                    width={1000}
                                    height={1000}
                                    quality={100}
                                    alt="Healthcare professional with patient"
                                    src="/1-Home Banner azul.png"
                                    className="h-auto w-full rounded-lg"
                                    priority
                                />
                                <div className="absolute bottom-0 h-20 w-full rounded-b-lg bg-gradient-to-t from-primary to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-20 mt-10 rounded-2xl bg-primary/5 p-10">
                <h2 className="mb-6 text-3xl font-bold text-primary">
                    Evan Home Care
                </h2>
                <p className="text-left text-lg leading-relaxed text-primary/90">
                    {dictionary.Home.texts.agencyFor}
                </p>
            </div>
        </div>
    );
}
