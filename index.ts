import { definePluginEntry, type OpenClawPluginDefinition } from "openclaw/plugin-sdk/plugin-entry";
import { createSerpApiWebSearchProvider } from "./src/serpapi-search-provider.js";

const plugin: OpenClawPluginDefinition = definePluginEntry({
  id: "serpapi",
  name: "SerpApi Search",
  description:
    "Web search provider backed by SerpApi (Google Light). Specialized SerpApi tools for news, flights, hotels, maps, shopping, YouTube, scholar, finance, and more follow in subsequent releases.",
  register(api) {
    api.registerWebSearchProvider(createSerpApiWebSearchProvider());
  },
});

export default plugin;
