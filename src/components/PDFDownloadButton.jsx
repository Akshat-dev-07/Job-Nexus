"use client";
import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF } from "./ResumePdf";

export default function PDFDownloadButton({ formData }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <button className="inline-block px-4 py-2 border-2 border-white bg-white text-orange-400 font-semibold rounded-lg text-sm sm:text-base cursor-not-allowed opacity-50">
                Loading PDF...
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={<ResumePDF formData={formData} />}
            fileName={`${formData.name || "resume"}_resume.pdf`}
            className="inline-block px-4 py-2 border-2 hover:text-white border-white bg-white hover:bg-orange-500/50 hover:cursor-pointer text-orange-400 font-semibold rounded-lg transition-colors duration-200 text-sm sm:text-base active:scale-98"
        >
            Download PDF
        </PDFDownloadLink>
    );
}