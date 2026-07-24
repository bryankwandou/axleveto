import type{Metadata}from"next";import{Inter,Manrope}from"next/font/google";import"./globals.css";
const inter=Inter({subsets:["latin"],variable:"--font-inter"});const display=Manrope({subsets:["latin"],variable:"--font-display"});
export const metadata:Metadata={title:{default:"AxleVeto — Verifiable Dispatch Safety",template:"%s · AxleVeto"},description:"Fleet dispatch interlock connecting driver inspections, maintenance intervals, and verifiable release authority."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${inter.variable} ${display.variable}`}>{children}</body></html>}
