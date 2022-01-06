import h from "@macrostrat/hyper";
import { useSelector, useDispatch } from "../state";
import classNames from "classnames";
import { ActiveMapLayer } from "cesium-viewer/actions";
import { OverlayLayer } from "./base";
import { Switch } from "@blueprintjs/core";
import { ContourControlsView } from "./contour";
import { ExpandableControlsView, LayerButton } from "../controls";

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

function LayerToggle({ name, layer, description, footprintsLayer }) {
  const dispatch = useDispatch();
  const hasFootprints = footprintsLayer != null;
  const active = useIsActive(layer);
  return h(
    ExpandableControlsView,
    {
      name,
      active,
      setActive() {
        dispatch({ type: "toggle-overlay", value: layer });
      },
    },
    h.if(hasFootprints)(Switch, {
      label: "Footprints",
      checked: useIsActive(footprintsLayer),
      onChange: () => {
        dispatch({ type: "toggle-overlay", value: footprintsLayer });
      },
    })
  );
}

function ContourControls() {
  const contourOptions = useSelector((s) => s.contourOptions);
  const dispatch = useDispatch();
  return h(ContourControlsView, {
    options: contourOptions,
    setOptions(value) {
      dispatch({ type: "set-contour-options", value });
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
      footprintsLayer: OverlayLayer.HiRISEFootprints,
    }),
    h(LayerToggle, {
      name: "Orthoimagery",
      layer: OverlayLayer.Ortho,
      description: "Orthoimagery for elevation models",
      footprintsLayer: OverlayLayer.OrthophotoFooprints,
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
    h(ContourControls),
    //h(LayerToggle, { name: "Rover position", layer: OverlayLayer.Rover }),
    h("h3", "Base layers"),
    h(BaseLayerSelector),
  ]);
}
