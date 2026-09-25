import "../css/card.css";
import HtmlCard from "./components/HtmlCard.vue";

Nova.booting((app) => {
    app.component("nova-card-html", HtmlCard);
});
