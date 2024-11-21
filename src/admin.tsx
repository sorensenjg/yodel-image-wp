import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/navigation";
import { CreditMenu } from "@/components/credit-menu";
import { IssueButton } from "@/components/issue-button";
import { GalleryPage } from "@/pages/gallery";
import { GeneratePage } from "@/pages/generate";
import { SettingsPage } from "@/pages/settings";
import { TestPage } from "@/pages/test";
import { Provider } from "./provider";

import "@/styles/globals.css";

export default function AdminApp() {
  return (
    <Provider>
      <Router>
        <div className="flex flex-col w-full h-[calc(100vh-var(--wp-admin--admin-bar--height))] overflow-hidden min-[783px]:h-[calc(100vh-var(--wp-admin--admin-bar--height)-40.15px)]">
          <div className="w-full bg-muted border-b">
            <div className="container flex justify-between items-center">
              <div className="flex items-center gap-12">
                <h1 className="text-xl font-bold inline-flex items-center sm:text-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-mountain fill-current"
                  >
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                  </svg>
                  Yodel Image
                </h1>
                <Navigation />
              </div>
              <div className="flex items-center gap-2">
                <CreditMenu />
                <IssueButton />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<GalleryPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/test" element={<TestPage />} />
            </Routes>
          </div>
        </div>
        <Toaster richColors />
      </Router>
    </Provider>
  );
}
