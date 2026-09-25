import { vi } from "vitest";

/**
 * Minimal stand-ins for the globals and components Nova injects at runtime.
 */
export function stubNova(response = { content: "<p>lazy</p>" }) {
    const get = vi.fn(() => Promise.resolve({ data: response }));

    global.Nova = { request: () => ({ get }) };

    return get;
}

export const globalStubs = {
    components: {
        Card: {
            template: '<div class="card"><slot /></div>',
        },
        Icon: {
            props: ["name", "type"],
            template: '<span class="icon">{{ name }}</span>',
        },
    },
    mocks: {
        __: (key) => key,
    },
};
