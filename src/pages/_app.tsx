import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import esEs from "antd/locale/es_ES";

const queryClient = new QueryClient({});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider locale={esEs}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}
