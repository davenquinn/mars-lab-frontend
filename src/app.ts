import { hyperStyled } from "@macrostrat/hyper";
import { APIProvider } from "@macrostrat/ui-components";
import { useRef, memo, useEffect } from "react";
import { Provider } from "react-redux";
import { MarsTerrainProvider, ImageryLayers } from "./layers";
import useDimensions from "use-element-dimensions";
import { Collapse } from "@blueprintjs/core";

import CesiumViewer from "cesium-viewer";
import { SelectedPoint } from "cesium-viewer/position";
import styles from "./main.styl";

import { LayerSelectorPanel } from "./layers/layer-selector";
import { TitleBlock, SoftwareInfo } from "./title-block";
import { TextPanel } from "./text-panel";
import { PositionListEditor, CopyPositionButton } from "./editor";
import positions from "./positions.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import viewerText from "../text/output/viewer.html";
import changelogText from "../text/output/changelog.html";
import { FlatMap } from "./map";
import {
  MapBackend,
  store,
  useSelector,
  useDispatch,
  OverlayLayer,
} from "./state";
import { SelectedLocation } from "./selected-location";
import { defaultContourOptions, useGlobeMaterial } from "./layers/contour";

const h = hyperStyled(styles);

const terrainProvider = new MarsTerrainProvider({ minZoomLevel: 0 });

const MapSelectedPoint = () => {
  const position = useSelector((d) => d.selectedLocation);
  return h(SelectedPoint, { point: position });
};

function GlobeMaterials() {
  const opts =
    useSelector((s) => s.layerOptions.get(OverlayLayer.Contour)) ??
    defaultContourOptions;
  const lyrs = useSelector((s) => s.overlayLayers);
  const contourEnabled = lyrs.has(OverlayLayer.Contour);

  useGlobeMaterial({ ...opts, hasContour: contourEnabled });
  return null;
}

const Viewer = () => {
  const displayQuality = useSelector((s) => s.displayQuality);
  const exaggeration = useSelector((s) => s.verticalExaggeration);
  const debug = useSelector((s) => s.debug);
  const dispatch = useDispatch();

  return h(
    CesiumViewer,
    {
      terrainProvider,
      terrainExaggeration: exaggeration,
      displayQuality,
      showInspector: debug,
      onClick(position) {
        dispatch({ type: "map-clicked", position });
      },
    },
    [h(ImageryLayers), h(MapSelectedPoint), h(GlobeMaterials)]
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

const MainUI = ({ scrollParentRef, onContentResize = null, expanded }) => {
  const [size, ref] = useDimensions();
  useEffect(() => {
    if (size == null) return;
    onContentResize?.(size);
  }, [size]);

  const selectedLocation = useSelector((s) => s.selectedLocation);
  if (selectedLocation != null) {
    return h(SelectedLocation, { point: selectedLocation });
  }

  return h("div.panel-main", { ref }, [
    h(TitleBlock),
    h(Collapse, { isOpen: expanded }, [
      h("div.scroll-pane", null, [
        h("div.panel-body", [
          h("div.panel-content", [
            h(Switch, [
              h(Route, { path: "/changelog" }, [
                h(TextPanel, { html: changelogText, scrollParentRef }),
              ]),
              h(Route, { path: "/about" }, [
                h(TextPanel, { html: viewerText, scrollParentRef }),
              ]),
              h(Route, { path: "/", exact: true }, h(SettingsPanel)),
              h(Route, { path: "/layers" }, h(LayerSelectorPanel)),
              h(Route, { path: "/list" }, [
                h(PositionListEditor, { positions }),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
};

const UI = () => {
  const expanded = useSelector((s) => s.uiExpanded);
  const ref = useRef();
  //const [{ width, height }, setSize] = useState({ width: null, height: null });

  return h(Router, { basename: baseURL }, [
    h("div.left-stack", [
      h(
        "div.left-panel",
        {
          ref,
          //style: { height, width },
          className: expanded ? "expanded" : "",
        },
        h(MainUI, {
          scrollParentRef: ref,
          // onContentResize({ width, height }) {
          //   setSize({ width, height });
          // },
          expanded,
        })
      ),
      h("div.spacer"),
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
