import { Card, CardBody } from "@heroui/react";
import { CustomNavbar } from "~/components/Navbar/Navbar";
import { Title } from "~/components/Titles/Title";

export default function PrivacyPage() {
    return (
        <>
            <CustomNavbar />
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <Title
                        title="Privacy Policy"
                        subtitle="Your privacy is important to us at Evan Home Care"
                    />

                    <div className="space-y-8">
                        {/* Introduction */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <p className="text-lg leading-relaxed text-gray-700">
                                    Welcome to Evan Home Care, LLC! These Terms
                                    and Conditions outline the rules and
                                    regulations for the use of our website,
                                    located at{" "}
                                    <span className="font-semibold text-primary">
                                        http://www.evanhomecare.com
                                    </span>
                                    .
                                </p>
                                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                                    By accessing this website, we assume you
                                    accept these Terms and Conditions. Do not
                                    continue to use{" "}
                                    <span className="font-semibold text-primary">
                                        http://www.evanhomecare.com
                                    </span>{" "}
                                    if you do not agree to all the terms and
                                    conditions stated on this page.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 1 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        1
                                    </span>
                                    The Information We Collect
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                                    We collect various types of information from
                                    our users to provide and improve our
                                    services. This includes:
                                </p>

                                <div className="space-y-4">
                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Personal Identification Information
                                        </h3>
                                        <p className="text-gray-700">
                                            This may include your name, email
                                            address, phone number, and mailing
                                            address when you voluntarily provide
                                            it, such as when you create an
                                            account, sign up for a newsletter,
                                            or make a purchase.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Payment Information
                                        </h3>
                                        <p className="text-gray-700">
                                            We collect payment details like your
                                            credit card number or other
                                            financial information to process
                                            transactions. This information is
                                            handled securely by our third-party
                                            payment processors and is not stored
                                            on our servers.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Technical and Usage Data
                                        </h3>
                                        <p className="text-gray-700">
                                            We automatically collect information
                                            about how you access and use our
                                            website. This can include your IP
                                            address, browser type, device
                                            information, pages you visit, and
                                            the time and date of your visit.
                                            This helps us understand user
                                            behavior and improve our site.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Cookies
                                        </h3>
                                        <p className="text-gray-700">
                                            We use cookies to enhance your
                                            experience. These are small data
                                            files stored on your device that
                                            help us remember your preferences,
                                            track site usage, and serve
                                            personalized content. You can manage
                                            your cookie preferences through your
                                            browser settings.
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Section 2 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        2
                                    </span>
                                    How We Use Your Information
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                                    The information we collect is used for
                                    various purposes, including:
                                </p>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                                        <h3 className="mb-3 font-semibold text-primary">
                                            To provide and maintain our services
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            This includes processing your
                                            orders, managing your account, and
                                            providing customer support.
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 p-6">
                                        <h3 className="mb-3 font-semibold text-secondary">
                                            To improve our website
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            We analyze user data to understand
                                            how our services are used and to
                                            make improvements to our design,
                                            functionality, and content.
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                                        <h3 className="mb-3 font-semibold text-primary">
                                            To communicate with you
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            We may use your contact information
                                            to send you updates, promotional
                                            materials, newsletters, and other
                                            information related to our services.
                                            You can opt out of these
                                            communications at any time.
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 p-6">
                                        <h3 className="mb-3 font-semibold text-secondary">
                                            For security purposes
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            We use your information to detect
                                            and prevent fraud, protect against
                                            unauthorized access, and ensure the
                                            security of our website and users.
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Section 3 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        3
                                    </span>
                                    Sharing Your Personal Information
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                                    We do not sell, rent, or trade your personal
                                    information with third parties for their
                                    marketing purposes. We may share your
                                    information with a limited number of trusted
                                    third parties in the following situations:
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
                                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                            •
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold text-primary">
                                                Service Providers
                                            </h3>
                                            <p className="text-gray-700">
                                                We may share your information
                                                with third-party vendors and
                                                service providers who help us
                                                operate our website and business
                                                (e.g., payment processors,
                                                shipping companies, data
                                                analysis services). These
                                                partners are required to protect
                                                your information and are only
                                                authorized to use it for the
                                                specific services they provide.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
                                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                            •
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold text-primary">
                                                Legal Requirements
                                            </h3>
                                            <p className="text-gray-700">
                                                We may disclose your information
                                                if required to do so by law or
                                                in response to valid requests by
                                                public authorities (e.g., a
                                                court order or subpoena).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
                                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                            •
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold text-primary">
                                                Business Transfers
                                            </h3>
                                            <p className="text-gray-700">
                                                In the event of a merger,
                                                acquisition, or sale of assets,
                                                your personal information may be
                                                transferred to the new owner.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Section 4 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        4
                                    </span>
                                    SMS and Text Messaging
                                </h2>
                                <p className="leading-relaxed text-gray-700">
                                    By providing your phone number and opting
                                    into text message communications, you
                                    consent to receive recurring automated
                                    marketing and informational text messages
                                    from{" "}
                                    <span className="font-semibold text-primary">
                                        http://www.evanhomecare.com
                                    </span>
                                    . Standard message and data rates may apply.
                                    Your SMS consent is not shared with any
                                    third parties or affiliates. You can
                                    unsubscribe at any time by replying "STOP"
                                    to any of our messages. For help, reply
                                    "HELP."
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 5 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        5
                                    </span>
                                    Your Rights
                                </h2>
                                <p className="text-lg leading-relaxed text-gray-700">
                                    You have the right to access, correct, or
                                    delete your personal information. You can
                                    manage your account information and
                                    communication preferences by logging into
                                    your account. If you need assistance, please
                                    contact us at{" "}
                                    <a
                                        href="mailto:admin@evanhomecare.com"
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        admin@evanhomecare.com
                                    </a>
                                    .
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 6 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        6
                                    </span>
                                    Changes to These Terms
                                </h2>
                                <p className="text-lg leading-relaxed text-gray-700">
                                    We may update our Terms and Conditions from
                                    time to time. We will notify you of any
                                    changes by posting the new terms on this
                                    page. We encourage you to review this page
                                    periodically for any updates.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 7 */}
                        <Card className="rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
                            <CardBody className="p-8 text-white">
                                <h2 className="mb-6 flex items-center text-2xl font-bold">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                                        7
                                    </span>
                                    Contact Us
                                </h2>
                                <p className="text-lg leading-relaxed">
                                    If you have any questions about these Terms
                                    and Conditions, please contact us at{" "}
                                    <a
                                        href="mailto:admin@evanhomecare.com"
                                        className="font-semibold hover:underline"
                                    >
                                        admin@evanhomecare.com
                                    </a>
                                    .
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
