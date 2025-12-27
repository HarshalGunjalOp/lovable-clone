import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { Client } from "./client";

export default function Page() {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.hello.queryOptions({text:"Harshal"}))

    return  (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<p>Loading...</p>}>
                <div>
                    <Client />
                </div>
            </Suspense>
        </HydrationBoundary>
    )
}