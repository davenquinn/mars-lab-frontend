import h from "@macrostrat/hyper";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";
import { ActiveMapLayer } from "cesium-viewer/actions";
import { OverlayLayer } from "../state";

const LayerButton = (props) => {
  const { name, active, ...rest } = props;
  const className = classNames({ "is-active": active });
  return h(
    "a.layer-button",
    {
      className,
      ...rest,
    },
    name
  );
};

const BaseLayerButton = (props) => {
  const baseLayer = useSelector((s) => s.mapLayer);
  const dispatch = useDispatch();
  const { layer, ...rest } = props;
  return h(LayerButton, {
    active: baseLayer == layer,
    onClick() {
      dispatch({ type: "set-map-layer", value: layer });
    },
    ...rest,
  });
};

function BaseLayerSelector() {
  return h("div.button-group", [
    h(BaseLayerButton, {
      name: "CTX global mosaic",
      layer: ActiveMapLayer.CTX,
    }),
    h(BaseLayerButton, {
      name: "Generative hillshade",
      layer: ActiveMapLayer.Hillshade,
    }),
    h(BaseLayerButton, {
      name: "Viking MDIM",
      layer: ActiveMapLayer.VikingMDIM,
    }),
    h(BaseLayerButton, {
      name: "OpenPlanetary hillshade",
      layer: ActiveMapLayer.OpenPlanetaryHillshade,
    }),
  ]);
}

function useIsActive(lyr) {
  const overlays = useSelector((s) => s.overlayLayers);
  return overlays.has(lyr);
}

function LayerToggle({ name, layer, description }) {
  const dispatch = useDispatch();
  return h(LayerButton, {
    name,
    active: useIsActive(layer),
    onClick() {
      dispatch({ type: "toggle-overlay", value: layer });
    },
  });
}

export function LayerSelectorPanel() {
  return h("div.layer-selector", [
    h("h3", "Overlays"),
    h(LayerToggle, {
      name: "HiRISE imagery",
      description:
        "High-resolution imagery (up to 25 cm/pixel). Currently limited to the Perseverance landing site.",
      layer: OverlayLayer.HiRISE,
    }),
    h(LayerToggle, {
      name: "Orthoimagery",
      layer: OverlayLayer.Ortho,
      description: "Orthoimagery for elevation models",
    }),
    h(LayerToggle, {
      name: "Global uncontrolled HiRISE",
      layer: OverlayLayer.ArcHiRISE,
      description: "Global HiRISE images",
    }),
    h(LayerToggle, {
      name: "Global orthoimagery",
      layer: OverlayLayer.ArcOrtho,
      description: "Global orthimagery",
    }),
    //h(LayerToggle, { name: "Rover position", layer: OverlayLayer.Rover }),
    h("h3", "Base layers"),
    h(BaseLayerSelector),
  ]);
}
