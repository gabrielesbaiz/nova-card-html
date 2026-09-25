import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Fetches a lazy card's HTML after the dashboard has painted.
 *
 * The dashboard's own query string is forwarded with every request: cards that
 * read request parameters inside content() must behave identically whether they
 * were rendered eagerly or fetched here.
 */
export function useLazyContent(card, rootEl) {
    const content = ref(card.content ?? "");
    const loading = ref(false);
    const failed = ref(false);

    let timer = null;
    let observer = null;
    let controller = null;
    let destroyed = false;

    const endpoint = card.lazyEndpoint;

    async function load() {
        if (destroyed || !card.lazyToken) {
            return;
        }

        // Supersede an in-flight request rather than racing it to the ref.
        controller?.abort();
        controller = new AbortController();

        loading.value = true;
        failed.value = false;

        try {
            const { data } = await Nova.request().get(endpoint, {
                params: {
                    token: card.lazyToken,
                    ...Object.fromEntries(
                        new URLSearchParams(window.location.search),
                    ),
                },
                signal: controller.signal,
            });

            if (!destroyed) {
                content.value = data.content ?? "";
            }
        } catch (error) {
            if (!destroyed && error?.name !== "CanceledError") {
                failed.value = true;
            }
        } finally {
            if (!destroyed) {
                loading.value = false;
            }
        }
    }

    function startPolling() {
        if (!card.refreshEvery) {
            return;
        }

        timer = setInterval(load, card.refreshEvery * 1000);
    }

    onMounted(() => {
        if (!card.lazy) {
            return;
        }

        if (
            card.deferUntilVisible &&
            typeof IntersectionObserver !== "undefined"
        ) {
            observer = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    observer?.disconnect();
                    observer = null;

                    load().then(startPolling);
                }
            });

            if (rootEl.value) {
                observer.observe(rootEl.value);

                return;
            }
        }

        load().then(startPolling);
    });

    onBeforeUnmount(() => {
        destroyed = true;

        clearInterval(timer);
        observer?.disconnect();
        controller?.abort();
    });

    return { content, loading, failed, reload: load };
}
