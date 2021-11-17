import { hyperStyled } from "@macrostrat/hyper";
import { APIProvider } from "@macrostrat/ui-components";
import { useRef, useState, memo } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { MarsTerrainProvider, ImageryLayers } from "./layers";

import CesiumViewer from "cesium-viewer";
import { SelectedPoint } from "cesium-viewer/position";
import styles from "./main.styl";

import { LayerSelectorPanel } from "./layer-selector";
import { TitleBlock, SoftwareInfo } from "./title-block";
import { TextPanel } from "./text-panel";
import { PositionListEditor, CopyPositionButton } from "./editor";
import positions from "./positions.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import mainText from "../text/output/main.html";
import viewerText from "../text/output/viewer.html";
import changelogText from "../text/output/changelog.html";
import { FlatMap } from "./map";
import { MapBackend, store } from "./state";
import { SelectedLocation } from "./selected-location";

const h = hyperStyled(styles);

const terrainProvider = new MarsTerrainProvider();

const MapSelectedPoint = () => {
  const position = useSelector((d) => d.selectedLocation);
  return h(SelectedPoint, { point: position });
};

const Viewer = () => {
  const displayQuality = useSelector((s) => s.displayQuality);
  const exaggeration = useSelector((s) => s.verticalExaggeration);
  const debug = useSelector((s) => s.debug);
  const dispatch = useDispatch();

  return h(
    CesiumViewer,
    {
      terrainProvider,
      terrainExaggeration: exaggeration / terrainProvider.RADIUS_SCALAR,
      displayQuality,
      showInspector: debug,
      onClick(position) {
        dispatch({ type: "map-clicked", position });
      },
    },
    [h(ImageryLayers), h(MapSelectedPoint)]
  );
};

const MemViewer = memo(Viewer);

const baseURL = process.env.PUBLIC_URL ?? "/";

function SettingsPanel() {
  return h("div.settings", [
    h(SoftwareInfo),
    h("div.auth-affil", [
      h("p.affiliation", [
        "Created by ",
        h("a", { href: "https://davenquinn.com" }, "Daven Quinn"),
        ", ",
        "UW – Madison, ",
        h("a", { href: "https://macrostrat.org" }, "Macrostrat"),
      ]),
    ]),
  ]);
}

const MainUI = ({ scrollParentRef }) => {
  const selectedLocation = useSelector((s) => s.selectedLocation);
  const uiExpanded = useSelector((s) => s.uiExpanded);
  if (selectedLocation != null) {
    return h(SelectedLocation, { point: selectedLocation });
  }

  const style = {};

  return h("div.content", { style }, [
    h(TitleBlock),
    h.if(uiExpanded)(Switch, [
      h(Route, { path: "/changelog" }, [
        h(TextPanel, { html: changelogText, scrollParentRef }),
      ]),
      h(Route, { path: "/about" }, [
        h(TextPanel, { html: viewerText, scrollParentRef }),
      ]),
      h(Route, { path: "/", exact: true }, h(SettingsPanel)),
      h(Route, { path: "/layers" }, h(LayerSelectorPanel)),
      h(Route, { path: "/list" }, [h(PositionListEditor, { positions })]),
    ]),
  ]);
};

const UI = () => {
  const ref = useRef();

  return h(Router, { basename: baseURL }, [
    h("div.left-stack", [
      h("div.left-panel", { ref }, h(MainUI, { scrollParentRef: ref })),
    ]),
    h("div.spacer"),
  ]);
};

const AppMain = () => {
  const mapBackend = useSelector((s) => s.mapBackend);

  return h("div.app-ui", [
    h("div.main-ui", null, h(UI)),
    h("div.main-map", null, [
      mapBackend == MapBackend.Globe ? h(MemViewer) : h(FlatMap),
      h(CopyPositionButton),
    ]),
  ]);
};

const App = () =>
  h(
    "div.app-container",
    null,
    h(
      APIProvider,
      { baseURL: process.env.API_BASE_URL + "/api/v1" },
      h(Provider, { store }, h(AppMain))
    )
  );

export default App;
