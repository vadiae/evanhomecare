import { Footer } from "~/components/Footer/Footer";
import { CustomNavbar } from "~/components/Navbar/Navbar";
import { SocialButtons } from "~/components/SideButtons/SideButtons";
import { FloatingButton } from "~/modules/FloatingButton/FloatingButton";
import { AboutUsSection } from "~/modules/Home/AboutUs/AboutUsSection";
import { ChooseUsSection } from "~/modules/Home/ChooseUs/ChooseUsSection";
import { HeroSection } from "~/modules/Home/Hero/Hero";
import { ServicesSection } from "~/modules/Home/Services/ServicesSection";
import Squares from "~/modules/Home/Squares/Squares";
import TopSection from "~/modules/Home/TopSection/TopSection";
import AwardSection from "~/modules/Home/AwardSection/AwardSection";

export default async function Home() {
    return (
        <>
            <main>
                <div className="hidden md:block">
                    <TopSection />
                </div>

                <CustomNavbar />

                <div className="mt-5 px-5 md:hidden">
                    <SocialButtons />
                </div>

                <div className="flex w-full flex-col items-center">
                    <div className="w-full max-w-[1440px] px-3 pb-20 sm:px-10">
                        <HeroSection />
                        <ServicesSection />
                        <Squares />
                        <AboutUsSection />
                        <ChooseUsSection />
                        <AwardSection />
                    </div>

                    <div className="w-full ">
                        <Footer />
                    </div>

                    <FloatingButton />
                </div>
            </main>
        </>
    );
}
