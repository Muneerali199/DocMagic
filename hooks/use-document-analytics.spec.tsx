import { renderHook, waitFor } from "@testing-library/react";
import { useDocumentAnalytics } from "./use-document-analytics";

const getSessionMock = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
    },
  }),
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe("useDocumentAnalytics", () => {
  const fetchMock = jest.fn();
  const sendBeaconMock = jest.fn();
  const blobMock = jest.fn((parts: BlobPart[], options?: BlobPropertyBag) => ({
    parts,
    options,
  }));

  beforeEach(() => {
    jest.clearAllMocks();

    getSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: "token-1",
        },
      },
    });

    globalThis.fetch = fetchMock;
    globalThis.Blob = blobMock as unknown as typeof Blob;
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeaconMock,
      configurable: true,
    });
  });

  it("aborts stale view tracking during rapid document remounts", async () => {
    const staleViewRequest = createDeferred<Response>();
    let staleViewInit: RequestInit | undefined;

    fetchMock
      .mockImplementationOnce((_: RequestInfo | URL, init?: RequestInit) => {
        staleViewInit = init;
        return staleViewRequest.promise;
      })
      .mockResolvedValueOnce({
        json: async () => ({ viewId: "fresh-view" }),
      });

    const { rerender, unmount } = renderHook(
      ({ documentId }: { documentId: string }) =>
        useDocumentAnalytics(documentId),
      { initialProps: { documentId: "doc-1" } },
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender({ documentId: "doc-2" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect((staleViewInit?.signal as AbortSignal).aborted).toBe(true);

    staleViewRequest.resolve({
      json: async () => ({ viewId: "stale-view" }),
    } as Response);

    await fetchMock.mock.results[1].value;

    unmount();

    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    const [, body] = sendBeaconMock.mock.calls[0];
    const payloadText = (body as { parts: string[] }).parts[0];
    const payload = JSON.parse(payloadText);

    expect(payload).toMatchObject({
      documentId: "doc-2",
      eventType: "duration",
      viewId: "fresh-view",
    });
  });
});
