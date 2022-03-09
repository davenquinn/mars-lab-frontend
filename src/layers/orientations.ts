import MVTImageryProvider from "mvt-imagery-provider";
import { useMemo, useEffect } from "react";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import { TagInput, FormGroup } from "@blueprintjs/core";
import { ControlOptions } from "../controls";
import { ExpandableLayerControl } from "./base";
import { OverlayLayer } from "../state";
// Code from Cesium js sandcastle

function createFilter(tags = null) {
  let filter: any = ["boolean", true];
  if (tags != null && tags.length != 0) {
    console.log(tags);
    const matches = tags.map((tag) => [
      "==",
      ["string", tag],
      ["at", 0, ["get", "tags"]],
    ]);
    filter = ["all", ["has", "tags"], ["any", ...matches]];
  }
  console.log(filter);
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
  }, [tags]);

  // useEffect(() => {
  //   provider.mapboxRenderer.setFilter("unit-edge", createFilter(tags));
  // }, [tags]);

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

export function OrientationControls({
  options = defaultContourOptions,
  setOptions,
}: OrientationControlsOptions) {
  return h(
    ExpandableLayerControl,
    {
      name: "Orientations",
      layer: OverlayLayer.Orientations,
      description: "Bedding traces from orienteer",
    },
    h(FormGroup, { label: "Tag filter" }, [
      h(TagInput, {
        values: options.tags ?? [],
        fill: true,
        onChange(values) {
          setOptions({ tags: values });
        },
      }),
    ])
  );
}

export { OrientationsLayer, OrientationControlsOptions };
