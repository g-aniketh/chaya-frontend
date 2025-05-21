import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-md border">
          <div className="h-12 border-b bg-secondary px-4">
            <div className="flex h-full items-center">
              {["name", "phone", "village", "status", "actions", "more"].map(
                (id) => (
                  <Skeleton key={id} className="h-4 w-40 mx-4" />
                )
              )}
            </div>
          </div>
          {[
            "row-1",
            "row-2",
            "row-3",
            "row-4",
            "row-5",
            "row-6",
            "row-7",
            "row-8",
            "row-9",
            "row-10",
          ].map((rowId) => (
            <div key={rowId} className="border-b px-4 py-4">
              <div className="flex items-center">
                {["name", "phone", "village", "status", "actions", "more"].map(
                  (id) => (
                    <Skeleton key={`row-${id}`} className="h-4 w-40 mx-4" />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1">
        <Skeleton className="h-9 w-9" />
        {["prev", "1", "2", "3", "next"].map((id) => (
          <Skeleton key={id} className="h-9 w-9 mx-1" />
        ))}
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}
