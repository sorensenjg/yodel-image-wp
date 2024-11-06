import {
  HashRouter as Router,
  Routes,
  Route,
  // useParams,
} from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { Credits } from "@/components/credits";
import { ImagesPage } from "@/pages/images";
import { GeneratePage } from "@/pages/generate";
import "@/styles/globals.css";

// function DetailView() {
//   const { id } = useParams<{ id: string }>();

//   return <div>Image ID: {id}</div>;
// }

export default function AdminApp() {
  return (
    <Router>
      <div className="flex flex-col w-full h-[calc(100vh-46px)] overflow-hidden min-[783px]:h-[calc(100vh-72.15px)]">
        <div className="w-full flex justify-between items-center px-4 py-1 bg-muted border-b">
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
          <Credits />
        </div>
        <div className="flex-1 relative flex w-full overflow-hidden">
          <Routes>
            <Route path="/" element={<ImagesPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            {/* <Route path="/image/:id" element={<DetailView />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
