import { Separator } from "@/components/ui/separator";
import { CreditMenu } from "@/components/credit-menu";
import { GenerateImage } from "@/components/generate-image";
import { Provider } from "./provider";

const { config, settings } = window.yodelImageAdmin;
const apiKey = settings.apiKey;

export default function Media() {
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="prose text-center">
          Please enter your valid API key on the{" "}
          <a href="/wp-admin/admin.php?page=yodel-image#/settings">
            settings page
          </a>
          <br />
          or{" "}
          <a
            href={`${config.apiUrl}/signup`}
            target="_blank"
            rel="noopener noreferrer"
          >
            create an account
          </a>{" "}
          to obtain one.
        </p>
      </div>
    );
  }

  return (
    <Provider>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="container p-0">
          <div className="container px-5 flex justify-between items-center gap-2 py-4">
            <h2 className="text-lg font-semibold whitespace-nowrap">
              Generate Image
            </h2>
            <div className="ml-auto flex space-x-2">
              <CreditMenu />
            </div>
          </div>
          <Separator />
        </div>
        <div className="container px-5 flex-1 py-6 overflow-auto">
          <GenerateImage />
        </div>
      </div>
    </Provider>
  );
}
