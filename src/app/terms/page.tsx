import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Title } from "~/components/Titles/Title";
import { CustomNavbar } from "~/components/Navbar/Navbar";
import { Footer } from "~/components/Footer/Footer";

export default function TermsPage() {
    return (
        <>
            <CustomNavbar />
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <Title
                        title="Terms of Service"
                        subtitle="Please read these terms carefully before using our services"
                    />

                    <div className="space-y-8">
                        {/* Introduction */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <p className="text-lg leading-relaxed text-gray-700">
                                    Welcome to{" "}
                                    <span className="font-semibold text-primary">
                                        http://www.evanhomecare.com
                                    </span>
                                    . This website is owned and operated by{" "}
                                    <span className="font-semibold text-primary">
                                        Evan Home Care, LLC
                                    </span>
                                    . By visiting our website and accessing the
                                    information, resources, services, products,
                                    and tools we provide, you understand and
                                    agree to accept and adhere to the following
                                    terms and conditions as stated in this
                                    policy (hereafter referred to as 'User
                                    Agreement'), along with the terms and
                                    conditions as stated in our Privacy Policy
                                    (please refer to the Privacy Policy section
                                    for more information).
                                </p>
                                <div className="mt-6 rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                    <p className="text-gray-700">
                                        <strong>
                                            This agreement is in effect as of:
                                        </strong>{" "}
                                        {new Date().toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            },
                                        )}
                                    </p>
                                </div>
                                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                                    We reserve the right to change this User
                                    Agreement from time to time without notice.
                                    You acknowledge and agree that it is your
                                    responsibility to review this User Agreement
                                    periodically to familiarize yourself with
                                    any modifications. Your continued use of
                                    this site after such modifications will
                                    constitute acknowledgment and agreement of
                                    the modified terms and conditions.
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
                                    Responsible Use and Conduct
                                </h2>
                                <div className="space-y-4">
                                    <p className="text-lg leading-relaxed text-gray-700">
                                        By visiting our website and accessing
                                        the resources we provide, you agree to
                                        use these resources only for the
                                        purposes intended as permitted by (a)
                                        the terms of this User Agreement, and
                                        (b) applicable laws, regulations, and
                                        generally accepted online practices or
                                        guidelines.
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Important:</strong> You are
                                        responsible for any consequences,
                                        losses, or damages that we may directly
                                        or indirectly incur or suffer due to any
                                        unauthorized activities conducted by
                                        you, as explained below, and may incur
                                        criminal or civil liability.
                                    </p>
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
                                    SMS Terms and Conditions
                                </h2>
                                <p className="mb-6 leading-relaxed text-gray-700">
                                    By providing your mobile phone number and
                                    opting in to receive SMS messages from us,
                                    you agree to the following terms:
                                </p>

                                <div className="space-y-4">
                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Message Content
                                        </h3>
                                        <p className="text-gray-700">
                                            You can expect to receive text
                                            messages related to our services,
                                            which may include, but are not
                                            limited to, appointment reminders,
                                            order alerts, account notifications,
                                            and promotional offers.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Messaging Frequency
                                        </h3>
                                        <p className="text-gray-700">
                                            Message frequency will vary.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Message and Data Rates
                                        </h3>
                                        <p className="text-gray-700">
                                            Message and data rates may apply.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Opt-out
                                        </h3>
                                        <p className="text-gray-700">
                                            You can cancel the SMS service at
                                            any time. Just text{" "}
                                            <span className="rounded bg-gray-200 px-2 py-1 font-mono">
                                                STOP
                                            </span>{" "}
                                            to the shortcode. After you send the
                                            SMS message STOP to us, we will send
                                            you an SMS message to confirm that
                                            you have been unsubscribed. After
                                            this, you will no longer receive SMS
                                            messages from us. If you want to
                                            join again, just sign up as you did
                                            the first time and we will start
                                            sending SMS messages to you again.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            For Assistance
                                        </h3>
                                        <p className="text-gray-700">
                                            If you are experiencing issues with
                                            the messaging program, you can reply
                                            with the keyword{" "}
                                            <span className="rounded bg-gray-200 px-2 py-1 font-mono">
                                                HELP
                                            </span>{" "}
                                            for more assistance, or you can get
                                            support by visiting our website at{" "}
                                            <a
                                                href="http://www.evanhomecare.com"
                                                className="font-semibold text-primary hover:underline"
                                            >
                                                http://www.evanhomecare.com
                                            </a>
                                            .
                                        </p>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-primary bg-blue-50 p-4">
                                        <h3 className="mb-2 font-semibold text-primary">
                                            Links to Policies
                                        </h3>
                                        <p className="text-gray-700">
                                            To review our privacy policy and
                                            terms of service, please visit our
                                            website at{" "}
                                            <a
                                                href="/privacy"
                                                className="font-semibold text-primary hover:underline"
                                            >
                                                http://www.evanhomecare.com/privacy
                                            </a>{" "}
                                            for the privacy policy and{" "}
                                            <a
                                                href="/terms"
                                                className="font-semibold text-primary hover:underline"
                                            >
                                                http://www.evanhomecare.com/terms
                                            </a>{" "}
                                            for the Terms of Service.
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
                                    Limitation of Warranties
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                                    By using our website, you understand and
                                    agree that all Resources we provide are "as
                                    is" and "as available." This means that we
                                    do not represent or warrant to you that:
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            i
                                        </span>
                                        <p className="mt-1 text-gray-700">
                                            the use of our Resources will meet
                                            your needs or requirements.
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            ii
                                        </span>
                                        <p className="mt-1 text-gray-700">
                                            the use of our Resources will be
                                            uninterrupted, timely, secure, or
                                            free from errors.
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            iii
                                        </span>
                                        <p className="mt-1 text-gray-700">
                                            the information obtained by using
                                            our Resources will be accurate or
                                            reliable, and
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            iv
                                        </span>
                                        <p className="mt-1 text-gray-700">
                                            any defects in the operation or
                                            functionality of any Resources we
                                            provide will be repaired or
                                            corrected.
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-6 text-gray-700">
                                    Furthermore, you understand and agree that
                                    any content downloaded or otherwise obtained
                                    through the use of our Resources is done at
                                    your own discretion and risk, and that you
                                    are solely responsible for any damage to
                                    your computer or other devices for any loss
                                    of data that may result from the download of
                                    such content.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 4 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        4
                                    </span>
                                    Limitation of Liability
                                </h2>
                                <p className="leading-relaxed text-gray-700">
                                    In conjunction with the Limitation of
                                    Warranties as explained above, you expressly
                                    understand and agree that any claim against
                                    us shall be limited to the amount you paid,
                                    if any, for use of products and/or services.{" "}
                                    <span className="font-semibold text-primary">
                                        Evan Home Care, LLC
                                    </span>{" "}
                                    will not be liable for any direct, indirect,
                                    incidental, consequential, or exemplary loss
                                    or damages which may be incurred by you as a
                                    result of using our Resources, or as a
                                    result of any changes, data loss or
                                    corruption, cancellation, loss of access, or
                                    downtime to the full extent that applicable
                                    limitation of liability laws apply.
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
                                    Copyrights/Trademarks
                                </h2>
                                <p className="leading-relaxed text-gray-700">
                                    All content and materials available on{" "}
                                    <span className="font-semibold text-primary">
                                        http://www.evanhomecare.com
                                    </span>
                                    , including but not limited to text,
                                    graphics, website name, code, images, and
                                    logos are the intellectual property of{" "}
                                    <span className="font-semibold text-primary">
                                        Evan Home Care, LLC
                                    </span>
                                    , and are protected by applicable copyright
                                    and trademark law. Any inappropriate use,
                                    including but not limited to the
                                    reproduction, distribution, display or
                                    transmission of any content on this site is
                                    strictly prohibited, unless specifically
                                    authorized by{" "}
                                    <span className="font-semibold text-primary">
                                        Evan Home Care, LLC
                                    </span>
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
                                    Termination of Use
                                </h2>
                                <p className="text-lg leading-relaxed text-gray-700">
                                    You agree that we may, at our sole
                                    discretion, suspend or terminate your access
                                    to all or part of our website and Resources
                                    with or without notice and for any reason,
                                    including, without limitation, breach of
                                    this User Agreement. Any suspected illegal,
                                    fraudulent or abusive activity may be
                                    grounds for terminating your relationship
                                    and may be referred to appropriate law
                                    enforcement authorities. Upon suspension or
                                    termination, your right to use the Resources
                                    we provide will immediately cease, and we
                                    reserve the right to remove or delete any
                                    information that you may have on file with
                                    us, including any account or login
                                    information.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 7 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        7
                                    </span>
                                    Governing Law
                                </h2>
                                <p className="mb-4 text-lg leading-relaxed text-gray-700">
                                    This website is controlled by{" "}
                                    <span className="font-semibold text-primary">
                                        Evan Home Care, LLC
                                    </span>{" "}
                                    from our offices located in the state of{" "}
                                    <span className="font-semibold text-primary">
                                        Florida
                                    </span>
                                    , United States. It can be accessed by most
                                    countries around the world. As each country
                                    has laws that may differ from those of{" "}
                                    <span className="font-semibold text-primary">
                                        Florida
                                    </span>
                                    , by accessing our website, you agree that
                                    the statutes and laws of{" "}
                                    <span className="font-semibold text-primary">
                                        Florida
                                    </span>
                                    , without regard to the conflict of laws and
                                    principles thereof, will apply to all
                                    matters relating to the use of this website
                                    and the purchase of any products or services
                                    through this site.
                                </p>
                                <p className="text-gray-700">
                                    Furthermore, any action to enforce this User
                                    Agreement shall be brought in the federal or
                                    state courts located in{" "}
                                    <span className="font-semibold text-primary">
                                        Osceola County, Florida
                                    </span>
                                    . You hereby agree to personal jurisdiction
                                    by such courts, and waive any
                                    jurisdictional, venue, or inconvenient forum
                                    objections to such courts.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 8 */}
                        <Card className="rounded-lg shadow-lg">
                            <CardBody className="p-8">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-primary">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                        8
                                    </span>
                                    Guarantee
                                </h2>
                                <p className="font-semibold leading-relaxed text-gray-700">
                                    UNLESS OTHERWISE EXPRESSED, EVAN HOME CARE,
                                    LLC EXPRESSLY DISCLAIMS ALL WARRANTIES AND
                                    CONDITIONS OF ANY KIND, WHETHER EXPRESS OR
                                    IMPLIED, INCLUDING, BUT NOT LIMITED TO THE
                                    IMPLIED WARRANTIES AND CONDITIONS OF
                                    MERCHANTABILITY, FITNESS FOR A PARTICULAR
                                    PURPOSE, AND NON-INFRINGEMENT.
                                </p>
                            </CardBody>
                        </Card>

                        {/* Section 9 - Contact */}
                        <Card className="rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
                            <CardBody className="p-8 text-white">
                                <h2 className="mb-6 flex items-center text-2xl font-bold">
                                    <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                                        9
                                    </span>
                                    Contact Information
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed">
                                    If you have any questions or comments about
                                    these our Terms of Service as outlined
                                    above, you can contact us at:
                                </p>

                                <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-semibold text-white">
                                                🏢
                                            </span>
                                            <div>
                                                <p className="font-semibold">
                                                    Evan Home Care, LLC
                                                </p>
                                                <p>1101 Miranda Ln Suite 127</p>
                                                <p>Kissimmee, FL., 34741</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span className="font-semibold text-white">
                                                📞
                                            </span>
                                            <p>(321) 300-9047</p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span className="font-semibold text-white">
                                                ✉️
                                            </span>
                                            <a
                                                href="mailto:admin@evanhomecare.com"
                                                className="font-semibold hover:underline"
                                            >
                                                admin@evanhomecare.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
