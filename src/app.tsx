import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Admin from "./admin";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Admin />
    </QueryClientProvider>
  );
}
