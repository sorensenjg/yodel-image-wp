import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/navigation";
import { CreditMenu } from "@/components/credit-menu";
import { IssueButton } from "@/components/issue-button";
import { GalleryPage } from "@/pages/gallery";
import { GeneratePage } from "@/pages/generate";
import { SettingsPage } from "@/pages/settings";
import { Provider } from "./provider";

export default function Admin() {
  return (
    <Provider>
      <Router>
        <div className="flex flex-col h-[calc(100vh-var(--wp-admin--admin-bar--height))] overflow-hidden">
          <div className="bg-muted border-b">
            <div className="container px-5 py-0 flex justify-between items-center gap-2">
              <div className="flex items-center gap-6">
                <h1 className="hidden text-lg font-bold items-center sm:text-xl sm:inline-flex">
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
                  <span className="hidden whitespace-nowrap md:inline">
                    Yodel Image
                  </span>
                </h1>
                <Navigation />
              </div>
              <div className="ml-auto flex space-x-2">
                <CreditMenu />
                <IssueButton />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<GalleryPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}
