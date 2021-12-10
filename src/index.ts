import "regenerator-runtime/runtime";
import h from "@macrostrat/hyper";
import { render } from "react-dom";
import "@blueprintjs/core/lib/css/blueprint.css";

import App from "./app";

import { FocusStyleManager } from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();

const base = document.createElement("div");
base.id = "app-container";
document.body.appendChild(base);

render(h(App), base);
