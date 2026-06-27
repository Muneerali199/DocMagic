const DRAFTDECK_QUEUE_DB = "draftdeckai-offline-queue";
const DRAFTDECK_QUEUE_STORE = "requests";
const DRAFTDECK_SYNC_TAG = "draftdeckai-sync-documents";

function isQueueableDraftRequest(request) {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) {
    return false;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return false;
  }

  return /^\/api\/(documents|presentations|templates)(\/.*)?$/.test(
    url.pathname,
  );
}

function openQueueDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFTDECK_QUEUE_DB, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DRAFTDECK_QUEUE_STORE)) {
        database.createObjectStore(DRAFTDECK_QUEUE_STORE, {
          autoIncrement: true,
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runStoreTransaction(mode, callback) {
  return openQueueDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(DRAFTDECK_QUEUE_STORE, mode);
        const store = transaction.objectStore(DRAFTDECK_QUEUE_STORE);
        const result = callback(store);

        transaction.oncomplete = () => {
          database.close();
          resolve(result);
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };
      }),
  );
}

async function queueDraftRequest(request) {
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const queuedRequest = {
    url: request.url,
    method: request.method,
    headers,
    body: await request.clone().text(),
    createdAt: Date.now(),
  };

  await runStoreTransaction("readwrite", (store) => store.add(queuedRequest));

  if ("sync" in self.registration) {
    await self.registration.sync.register(DRAFTDECK_SYNC_TAG);
  }
}

async function getQueuedRequests() {
  return runStoreTransaction(
    "readonly",
    (store) =>
      new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

async function deleteQueuedRequest(id) {
  await runStoreTransaction("readwrite", (store) => store.delete(id));
}

let isReplaying = false;

async function replayQueuedRequests() {
  if (isReplaying) return;
  isReplaying = true;
  try {
    const requests = await getQueuedRequests();

    for (const queuedRequest of requests) {
      const response = await fetch(queuedRequest.url, {
        method: queuedRequest.method,
        headers: queuedRequest.headers,
        body: queuedRequest.body,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Queued request failed with ${response.status}`);
      }

      await deleteQueuedRequest(queuedRequest.id);
    }
  } finally {
    isReplaying = false;
  }
}

self.addEventListener("fetch", (event) => {
  if (!isQueueableDraftRequest(event.request)) {
    return;
  }

  event.respondWith(
    fetch(event.request.clone()).catch(async () => {
      await queueDraftRequest(event.request);

      return new Response(
        JSON.stringify({
          queued: true,
          message:
            "DraftDeckAI saved this request locally and will sync it when the network returns.",
        }),
        {
          status: 202,
          headers: {
            "Content-Type": "application/json",
            "X-DraftDeckAI-Queued": "true",
          },
        },
      );
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === DRAFTDECK_SYNC_TAG) {
    event.waitUntil(replayQueuedRequests());
  }
});

self.addEventListener("online", () => {
  replayQueuedRequests().catch(() => undefined);
});
