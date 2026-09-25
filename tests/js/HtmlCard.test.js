import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HtmlCard from "../../resources/js/components/HtmlCard.vue";
import { globalStubs, stubNova } from "./setup";

function makeCard(overrides = {}) {
    return {
        title: "",
        content: "",
        height: "dynamic",
        maxHeight: null,
        align: "left",
        center: false,
        icon: null,
        theme: "default",
        cardStyles: true,
        collapsible: false,
        collapsedByDefault: false,
        styles: null,
        header: null,
        footer: null,
        lazy: false,
        lazyToken: null,
        lazyEndpoint: "/nova-vendor/nova-card-html/content",
        deferUntilVisible: false,
        refreshEvery: null,
        placeholder: null,
        ...overrides,
    };
}

function mountCard(card) {
    return mount(HtmlCard, { props: { card }, global: globalStubs });
}

beforeEach(() => {
    stubNova();
    window.history.replaceState({}, "", "/");
});

afterEach(() => {
    vi.useRealTimers();
});

describe("eager rendering", () => {
    it("renders server rendered html", () => {
        const wrapper = mountCard(makeCard({ content: "<b>hi</b>" }));

        expect(wrapper.html()).toContain("<b>hi</b>");
    });

    it("renders the title and icon", () => {
        const wrapper = mountCard(makeCard({ title: "T", icon: "user" }));

        expect(wrapper.text()).toContain("T");
        expect(wrapper.find(".icon").text()).toBe("user");
    });

    it("applies the alignment class", () => {
        expect(mountCard(makeCard({ align: "center" })).html()).toContain(
            "nova-card-html-align-center",
        );
    });

    it("falls back to the legacy center flag when align is absent", () => {
        const card = makeCard({ center: true });
        delete card.align;

        expect(mountCard(card).html()).toContain("nova-card-html-align-center");
    });

    it("applies max-height inline rather than via Tailwind classes", () => {
        // Arbitrary Tailwind values only exist in the host app's build, so a
        // packaged card cannot rely on them.
        const wrapper = mountCard(
            makeCard({ height: "fixed", maxHeight: 240 }),
        );

        const body = wrapper.find(".nova-card-html-body");

        expect(body.attributes("style")).toContain("max-height: 240px");
        expect(body.classes()).toContain("nova-card-html-scroll");
    });

    it("emits card scoped styles", () => {
        const wrapper = mountCard(makeCard({ styles: ".x { color: red }" }));

        // html() pretty-prints, so assert on the element rather than the string.
        expect(wrapper.find("style").text()).toContain("color: red");
    });

    it("renders header and footer slots", () => {
        const wrapper = mountCard(
            makeCard({ header: "<b>h</b>", footer: "<i>f</i>" }),
        );

        expect(wrapper.html()).toContain("<b>h</b>");
        expect(wrapper.html()).toContain("<i>f</i>");
    });
});

describe("collapsing", () => {
    it("hides the body when collapsed by default", async () => {
        const wrapper = mountCard(
            makeCard({
                title: "T",
                content: "<b>hi</b>",
                collapsible: true,
                collapsedByDefault: true,
            }),
        );

        expect(wrapper.html()).not.toContain("<b>hi</b>");

        await wrapper.find("button").trigger("click");

        expect(wrapper.html()).toContain("<b>hi</b>");
    });
});

describe("lazy loading", () => {
    it("shows a skeleton then the fetched content", async () => {
        const get = stubNova({ content: "<p>lazy</p>" });

        const wrapper = mountCard(makeCard({ lazy: true, lazyToken: "tok" }));

        expect(wrapper.find(".nova-card-html-skeleton").exists()).toBe(true);

        await flushPromises();

        expect(get).toHaveBeenCalledTimes(1);
        expect(wrapper.html()).toContain("<p>lazy</p>");
        expect(wrapper.find(".nova-card-html-skeleton").exists()).toBe(false);
    });

    it("forwards the dashboard query string", async () => {
        const get = stubNova();
        window.history.replaceState({}, "", "/?window=240");

        mountCard(makeCard({ lazy: true, lazyToken: "tok" }));

        await flushPromises();

        expect(get.mock.calls[0][1].params).toMatchObject({
            token: "tok",
            window: "240",
        });
    });

    it("renders a custom placeholder instead of the skeleton", () => {
        const wrapper = mountCard(
            makeCard({
                lazy: true,
                lazyToken: "tok",
                placeholder: "<em>wait</em>",
            }),
        );

        expect(wrapper.find(".nova-card-html-body").html()).toContain("wait");
        expect(wrapper.find(".nova-card-html-skeleton").exists()).toBe(false);
    });

    it("shows a retry affordance when the request fails", async () => {
        global.Nova = {
            request: () => ({
                get: vi.fn(() => Promise.reject(new Error("boom"))),
            }),
        };

        const wrapper = mountCard(makeCard({ lazy: true, lazyToken: "tok" }));

        await flushPromises();

        expect(wrapper.find(".nova-card-html-error").exists()).toBe(true);
    });

    it("does not fetch when the card is not lazy", async () => {
        const get = stubNova();

        mountCard(makeCard({ content: "<b>eager</b>" }));

        await flushPromises();

        expect(get).not.toHaveBeenCalled();
    });

    it("polls on the refresh interval and stops on unmount", async () => {
        vi.useFakeTimers();
        const get = stubNova();

        const wrapper = mountCard(
            makeCard({ lazy: true, lazyToken: "tok", refreshEvery: 5 }),
        );

        await vi.advanceTimersByTimeAsync(0);
        expect(get).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(5000);
        expect(get).toHaveBeenCalledTimes(2);

        wrapper.unmount();

        await vi.advanceTimersByTimeAsync(20000);
        expect(get).toHaveBeenCalledTimes(2);
    });

    it("waits for visibility when deferUntilVisible is set", async () => {
        const get = stubNova();

        let trigger;
        global.IntersectionObserver = class {
            constructor(callback) {
                trigger = callback;
            }
            observe() {}
            disconnect() {}
        };

        mountCard(
            makeCard({ lazy: true, lazyToken: "tok", deferUntilVisible: true }),
        );

        await flushPromises();
        expect(get).not.toHaveBeenCalled();

        trigger([{ isIntersecting: true }]);
        await flushPromises();

        expect(get).toHaveBeenCalledTimes(1);

        delete global.IntersectionObserver;
    });
});
