import "./globals.css";
import Header from "@/components/Header";
import PreviewBanner from "@/components/PreviewBanner";

export const metadata = {
  title: "KARA Public Records Tracker",
  description: "Log public records requests and track response deadlines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PreviewBanner />
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
