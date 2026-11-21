import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

// Inter is already loaded by the root layout as --font-inter.
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-sg" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jb" });

/** Class names for the .hos wrapper. */
export const hosFonts = `hos ${spaceGrotesk.variable} ${jetbrains.variable}`;
