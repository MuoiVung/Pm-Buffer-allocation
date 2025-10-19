import type { Metadata } from "next";
import "./globals.css";
// FIX: Import React to make the React namespace available for types like React.ReactNode.
import React from "react";

export const metadata: Metadata = {
  title: "Buffer Allocation Optimizer",
  description:
    "An application to solve the Buffer Allocation Problem (BAP) using a Genetic Algorithm. This tool helps optimize production line efficiency by finding the best buffer distribution to maximize throughput while minimizing costs, based on a simulated machine learning model.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100 font-sans">{children}</body>
    </html>
  );
}
