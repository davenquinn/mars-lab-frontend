import MVTImageryProvider from "mvt-imagery-provider";
import { useMemo, useEffect } from "react";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import { NumericInput, FormGroup } from "@blueprintjs/core";
import { ControlOptions, ExpandableControlsView } from "../controls";
import { ExpandableLayerControl, useIsActive } from "./base";
import { OverlayLayer } from "../state";
// Code from Cesium js sandcastle

function createFilter(tags = null) {
  let filter = ["boolean", true];
  if (tags != null) {
    const matches = tags.map((tag) => ["in", tag, ["get", "tags"]]);
    filter = ["any", ...matches];
  }
  return filter;
}

function createStyle(tags = null) {
  return {
    version: 8,
    sources: {
      orientations: {
        type: "vector",
        tiles: [
          "https://argyre.geoscience.wisc.edu/orienteer/api/orientations/{z}/{x}/{y}.pbf",
        ],
        maxzoom: 18,
        minzoom: 10,
      },
    },
    layers: [
      {
        id: "unit-edge",
        source: "orientations",
        "source-layer": "trace",
        type: "line",
        layout: {
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1.5,
        },
        filter: createFilter(tags),
      },
    ],
  };
}

const OrientationsLayer = ({ tags, ...rest }) => {
  // This is a kind of crazy thing
  const provider = useMemo(() => {
    const style = createStyle(tags);

    let prov = new MVTImageryProvider({
      style,
      maximumZoom: 18,
      minimumZoom: 10,
    });

    return prov;
  }, []);

  useEffect(() => {
    provider.mapboxRenderer.setFilter("unit-edge", createFilter(tags));
  }, [tags]);

  return h(ImageryLayer, { imageryProvider: provider, ...rest });
};

// UI components

export interface OrientationOptions {
  tags: string[] | null;
}

export const defaultContourOptions = {
  tags: null,
};

type OrientationControlsOptions = ControlOptions<OrientationOptions>;

export function OrientationControlsView({
  options = defaultContourOptions,
  setOptions,
}: OrientationControlsOptions) {
  return h(
    ExpandableLayerControl,
    {
      name: "Orientations",
      layer: OverlayLayer.Orientations,
    },
    h(FormGroup, { inline: true, label: "Tags" }, [
      // h(NumericInput, {
      //   placeholder: "Contour interval",
      //   value: options.contourSpacing,
      //   max: 1000,
      //   min: 5,
      //   onValueChange(value) {
      //     setOptions({ ...options, contourSpacing: value });
      //   },
      // }),
    ])
  );
}

export { OrientationsLayer, OrientationControlsOptions };
