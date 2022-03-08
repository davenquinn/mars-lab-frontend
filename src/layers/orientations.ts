import MVTImageryProvider from "mvt-imagery-provider";
import { useMemo, useEffect } from "react";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";

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

export { OrientationsLayer };
