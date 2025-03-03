import Card from "./components/Card";
import RangedCard from "./components/RangedCard";

Nova.booting((Vue) => {
    Vue.component("nova-html-card", Card);
    Vue.component("nova-html-ranged-card", RangedCard);
});
