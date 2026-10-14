// @ts-expect-error Node built-ins are used only by Vitest; browser project types intentionally exclude Node.
import { readFileSync } from 'node:fs'
// @ts-expect-error Node built-ins are used only by Vitest; browser project types intentionally exclude Node.
import { runInNewContext } from 'node:vm'

import { describe, expect, it, vi } from 'vitest'

const ORIGIN = 'https://mardakhay.test'
const CACHE_NAME = 'mardakhay-labs-v6'
const WORKER_SOURCE = readFileSync(
  new URL('../../../public/sw.js', import.meta.url),
  'utf8',
)

type RequestStub = {
  url: string
  method: string
  mode: string
}

type CacheRequest = string | { url: string }

type CacheMock = {
  addAll: (requests: string[]) => Promise<void>
  put: (request: CacheRequest, response: Response) => Promise<void>
  match: (request: CacheRequest) => Promise<Response | undefined>
}

type WorkerEventHandler = (event: unknown) => void

function cacheKey(request: CacheRequest) {
  return new URL(typeof request === 'string' ? request : request.url, ORIGIN).href
}

function createServiceWorkerHarness() {
  const handlers = new Map<string, WorkerEventHandler>()
  const stores = new Map<string, Map<string, Response>>()
  let networkFetch: (request: RequestStub) => Promise<Response> = async (request) => {
    if (new URL(request.url).pathname === '/asset-manifest.json') {
      return new Response(JSON.stringify({
        'src/main.tsx': {
          file: 'assets/index-main.js',
          css: ['assets/index-main.css'],
          assets: ['assets/logo.svg'],
        },
        'src/pages/PromptsPage.tsx': {
          file: 'assets/PromptsPage-chunk.js',
          css: ['assets/PromptsPage.css'],
          isDynamicEntry: true,
        },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response('network response', { status: 200 })
  }

  const fetchMock = vi.fn((request: RequestStub) => networkFetch(request))

  function ensureStore(name: string) {
    let store = stores.get(name)

    if (!store) {
      store = new Map<string, Response>()
      stores.set(name, store)
    }

    return store
  }

  function createCache(name: string): CacheMock {
    return {
      addAll: async (requests) => {
        const store = ensureStore(name)

        for (const request of requests) {
          const response = await fetchMock({
            url: cacheKey(request),
            method: 'GET',
            mode: 'cors',
          })

          if (!response.ok) {
            throw new Error('Failed to precache app shell')
          }

          store.set(cacheKey(request), response.clone())
        }
      },
      put: async (request, response) => {
        ensureStore(name).set(cacheKey(request), response.clone())
      },
      match: async (request) => ensureStore(name).get(cacheKey(request))?.clone(),
    }
  }

  const caches = {
    open: async (name: string) => createCache(name),
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    match: async (request: CacheRequest) => {
      for (const store of stores.values()) {
        const response = store.get(cacheKey(request))

        if (response) return response.clone()
      }

      return undefined
    },
  }

  const skipWaiting = vi.fn(async () => undefined)
  const claim = vi.fn(async () => undefined)
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, listener: WorkerEventHandler) => {
      handlers.set(type, listener)
    },
    skipWaiting,
    clients: { claim },
  }

  runInNewContext(WORKER_SOURCE, {
    self,
    caches,
    fetch: fetchMock,
    URL,
    Response,
    console,
  })

  async function dispatchLifecycle(type: string) {
    const pending: Promise<unknown>[] = []
    const handler = handlers.get(type)

    if (!handler) throw new Error(`Missing ${type} handler`)

    handler({
      waitUntil: (promise: Promise<unknown>) => pending.push(Promise.resolve(promise)),
    })

    await Promise.all(pending)
  }

  async function dispatchFetch(request: RequestStub) {
    const pending: Promise<unknown>[] = []
    let responsePromise: Promise<Response> | undefined
    const handler = handlers.get('fetch')

    if (!handler) throw new Error('Missing fetch handler')

    handler({
      request,
      respondWith: (response: Response | Promise<Response>) => {
        responsePromise = Promise.resolve(response)
      },
      waitUntil: (promise: Promise<unknown>) => pending.push(Promise.resolve(promise)),
    })

    const response = responsePromise ? await responsePromise : undefined
    await Promise.all(pending)

    return { handled: Boolean(responsePromise), response }
  }

  return {
    cacheNames: () => caches.keys(),
    cachedResponse: async (cacheName: string, request: CacheRequest) =>
      (await createCache(cacheName).match(request)) ?? undefined,
    dispatchFetch,
    dispatchLifecycle,
    fetchMock,
    seedCache: async (cacheName: string, request: CacheRequest, response: Response) => {
      await createCache(cacheName).put(request, response)
    },
    setNetworkFetch: (implementation: (request: RequestStub) => Promise<Response>) => {
      networkFetch = implementation
    },
    skipWaiting,
    claim,
  }
}

describe('public/sw.js cache strategy', () => {
  it('precaches every compiled bundle before allowing the worker to activate', async () => {
    const worker = createServiceWorkerHarness()

    await worker.dispatchLifecycle('install')

    expect(await worker.cacheNames()).toContain(CACHE_NAME)
    expect(await worker.cachedResponse(CACHE_NAME, '/asset-manifest.json')).toBeDefined()
    expect(await worker.cachedResponse(CACHE_NAME, '/assets/index-main.js')).toBeDefined()
    expect(await worker.cachedResponse(CACHE_NAME, '/assets/index-main.css')).toBeDefined()
    expect(await worker.cachedResponse(CACHE_NAME, '/assets/PromptsPage-chunk.js')).toBeDefined()
    expect(await worker.cachedResponse(CACHE_NAME, '/assets/PromptsPage.css')).toBeDefined()
    expect(await worker.cachedResponse(CACHE_NAME, '/assets/logo.svg')).toBeDefined()
    expect(worker.skipWaiting).toHaveBeenCalledOnce()
  })

  it('uses network-first navigation and caches only successful HTML responses', async () => {
    const worker = createServiceWorkerHarness()
    worker.setNetworkFetch(async () => new Response('fresh app shell', { status: 200 }))

    const result = await worker.dispatchFetch({
      url: `${ORIGIN}/prompts`,
      method: 'GET',
      mode: 'navigate',
    })

    expect(result.handled).toBe(true)
    expect(await result.response?.text()).toBe('fresh app shell')
    expect(await (await worker.cachedResponse(CACHE_NAME, '/index.html'))?.text())
      .toBe('fresh app shell')
  })

  it('serves the cached app shell when offline navigation fails', async () => {
    const worker = createServiceWorkerHarness()
    await worker.seedCache(CACHE_NAME, '/index.html', new Response('cached app shell'))
    worker.setNetworkFetch(async () => {
      throw new Error('offline')
    })

    const result = await worker.dispatchFetch({
      url: `${ORIGIN}/favorites`,
      method: 'GET',
      mode: 'navigate',
    })

    expect(result.handled).toBe(true)
    expect(await result.response?.text()).toBe('cached app shell')
  })

  it('does not replace the cached app shell with a server error response', async () => {
    const worker = createServiceWorkerHarness()
    await worker.seedCache(CACHE_NAME, '/index.html', new Response('known good shell'))
    worker.setNetworkFetch(async () => new Response('server error', { status: 503 }))

    const result = await worker.dispatchFetch({
      url: `${ORIGIN}/prompts`,
      method: 'GET',
      mode: 'navigate',
    })

    expect(result.response?.status).toBe(503)
    expect(await (await worker.cachedResponse(CACHE_NAME, '/index.html'))?.text())
      .toBe('known good shell')
  })

  it('runtime-caches fingerprinted build assets and serves them offline', async () => {
    const worker = createServiceWorkerHarness()
    worker.setNetworkFetch(async () => new Response('compiled JavaScript', { status: 200 }))

    const request = {
      url: `${ORIGIN}/assets/app-abcd1234.js`,
      method: 'GET',
      mode: 'cors',
    }
    const first = await worker.dispatchFetch(request)

    expect(first.handled).toBe(true)
    expect(await (await worker.cachedResponse(CACHE_NAME, request))?.text())
      .toBe('compiled JavaScript')

    worker.setNetworkFetch(async () => {
      throw new Error('offline')
    })
    const second = await worker.dispatchFetch(request)

    expect(second.handled).toBe(true)
    expect(await second.response?.text()).toBe('compiled JavaScript')
  })

  it('does not intercept dynamic same-origin endpoints or cross-origin requests', async () => {
    const worker = createServiceWorkerHarness()

    const dynamic = await worker.dispatchFetch({
      url: `${ORIGIN}/api/private-profile`,
      method: 'GET',
      mode: 'cors',
    })
    const supabase = await worker.dispatchFetch({
      url: 'https://example.supabase.co/rest/v1/prompts',
      method: 'GET',
      mode: 'cors',
    })

    expect(dynamic.handled).toBe(false)
    expect(supabase.handled).toBe(false)
    expect(worker.fetchMock).not.toHaveBeenCalled()
  })

  it('does not intercept non-GET requests', async () => {
    const worker = createServiceWorkerHarness()

    const result = await worker.dispatchFetch({
      url: `${ORIGIN}/assets/app-abcd1234.js`,
      method: 'POST',
      mode: 'cors',
    })

    expect(result.handled).toBe(false)
    expect(worker.fetchMock).not.toHaveBeenCalled()
  })

  it('deletes only stale caches owned by this application', async () => {
    const worker = createServiceWorkerHarness()
    await worker.seedCache('mardakhay-labs-v2', '/index.html', new Response('old'))
    await worker.seedCache('another-app-cache', '/index.html', new Response('keep'))
    await worker.seedCache(CACHE_NAME, '/index.html', new Response('current'))

    await worker.dispatchLifecycle('activate')

    const cacheNames = await worker.cacheNames()
    expect(cacheNames).toContain(CACHE_NAME)
    expect(cacheNames).toContain('another-app-cache')
    expect(cacheNames).not.toContain('mardakhay-labs-v2')
    expect(worker.claim).toHaveBeenCalledOnce()
  })
})
