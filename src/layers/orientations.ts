import MVTImageryProvider from "mvt-imagery-provider";
import { useMemo } from "react";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";

function createStyle(visibleMaps = null) {
  let filter = ["boolean", true];
  if (visibleMaps != null) {
    filter = ["match", ["get", "map_id"], visibleMaps, true, false];
  }

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
        filter,
      },
    ],
  };
}

const OrientationsLayer = (rest) => {
  const style = createStyle(null);
  // This is a kind of crazy thing
  const provider = useMemo(() => {
    let prov = new MVTImageryProvider({
      style,
      maximumZoom: 18,
      //minimumZoom: 10,
    });
    // let filter: any = ["boolean", true];
    // if (visibleMaps != null) {
    //   filter = [
    //     "match",
    //     ["get", "map_id"],
    //     Array.from(visibleMaps),
    //     true,
    //     false,
    //   ];
    // }
    //console.log(filter);
    //prov.mapboxRenderer.setFilter("map-units", filter, false);
    //const res = prov.mapboxRenderer.setFilter("unit-edge", filter, false);
    //res();
    return prov;
  }, []);

  return h(ImageryLayer, { imageryProvider: provider, ...rest });
};

export { OrientationsLayer };
