import { useRef } from "react";
import { Credit, TileMapServiceImageryProvider } from "cesium";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import {
  GeoLayerProps,
  MarsHillshadeLayer,
  //MapboxVectorTileImageryProvider,
} from "cesium-viewer/layers";
import {
  MartiniTerrainProvider,
  TileCoordinates,
  DefaultHeightmapResource,
  StretchedTilingScheme,
} from "@macrostrat/cesium-martini";
import SphericalMercator from "@mapbox/sphericalmercator";
const Cesium: any = require("cesiumSource/Cesium");
import { ImageryLayerCollection, GeoJsonDataSource } from "resium";
import { ActiveMapLayer } from "cesium-viewer/actions";
import { useSelector } from "react-redux";
import { ArcGISAstroImageryProvider, BaseImageryLayer } from "./base";
import { OverlayLayer } from "./base";
import { OrientationsLayer } from "./orientations";

const MARS_RADIUS_SCALAR = 3390 / 6371;

function tileServerURL(uri: string) {
  return process.env.TILE_SERVER_URL + uri;
}

// These mosaics are static, ours are dynamic.
function ArcMDIMLayer(props: GeoLayerProps) {
  return h(ArcGISAstroImageryProvider, {
    layerID: "MDIM",
    credit: "USGS / ESRI",
  });
}

function ArcCTXLayer(props: GeoLayerProps) {
  return h(ArcGISAstroImageryProvider, {
    layerID: "CTX",
    credit: "Murray Lab / CTX / ESRI",
  });
}

function ArcHiRISELayer(props: GeoLayerProps) {
  return h(ArcGISAstroImageryProvider, {
    layerID: "HiRISE",
    credit: "Murray Lab / CTX / ESRI",
  });
}

const HiRISELayer = (props: GeoLayerProps) => {
  return h(BaseImageryLayer, {
    url: tileServerURL(
      `/mosaic/hirise_red/tiles/{TileMatrix}/{TileCol}/{TileRow}.png`
    ),
    credit: "USGS/HiRISE",
    colorToAlpha: Cesium.Color.BLACK,
    tileWidth: 256,
    tileHeight: 256,
  });
};

const OrthoLayer = (props: GeoLayerProps) => {
  return h(BaseImageryLayer, {
    url: tileServerURL(
      `/mosaic/orthoimage/tiles/{TileMatrix}/{TileCol}/{TileRow}.png?rescale=0,255`
    ),
    credit: "USGS/HiRISE",
    colorToAlpha: Cesium.Color.BLACK,
    tileWidth: 256,
    tileHeight: 256,
  });
};

const MOLALayer = (props: GeoLayerProps) => {
  let ctx = useRef(
    new TileMapServiceImageryProvider({
      url: "https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-gray",
      fileExtension: "png",
      maximumLevel: 6,
      layer: "",
      tileMatrixSetID: "",
      // Convince the viewer to load a lower level of detail for global tiles
      // to avoid stressing the server
      // tileWidth: 512,
      // tileHeight: 512,
      // Global coverage
      rectangle: new Cesium.Rectangle(
        -Math.PI,
        -Math.PI / 2,
        Math.PI,
        Math.PI / 2
      ),
      credit: new Credit("OpenPlanetaryMap/CARTO"),
      ellipsoid: Cesium.Ellipsoid.MARSIAU2000,
      tilingScheme: new Cesium.WebMercatorTilingScheme({
        ellipsoid: Cesium.Ellipsoid.MARSIAU2000,
      }),
    })
  );
  return h(ImageryLayer, { imageryProvider: ctx.current, ...props });
};

let merc = new SphericalMercator({ size: 256 });

let bounds = {
  w: 72,
  s: 13,
  e: 80,
  n: 23,
};

const tilingScheme = new StretchedTilingScheme({
  ellipsoid: Cesium.Ellipsoid.MARSIAU2000,
});

let resource = new DefaultHeightmapResource({
  url: tileServerURL(`/elevation-mosaic/tiles/{z}/{x}/{y}.png`),
});
class MarsTerrainProvider extends MartiniTerrainProvider {
  meshErrorScalar = 1;
  levelOfDetailScalar = 8;
  credit = new Credit(
    "University of Arizona - HiRISE, CTX, PDS Imaging Node, HRSC Mission Team"
  );

  constructor(opts = {}) {
    super({ ...opts, tilingScheme, resource });
  }

  getTileDataAvailable(x, y, z) {
    // const [w, s, e, n] = merc.bbox(x, y, z);
    // if (e < bounds.w || w > bounds.e || n < bounds.s || s > bounds.n)
    //   return false;
    if (z % 2 == 1) return false;
    return true;
  }
}

// const CRISMLayer = (props: GeoLayerProps) => {
//   let ctx = useRef(
//     new WebMapTileServiceImageryProvider({
//       url:
//         process.env.API_BASE_URL +
//         "/tiles/crism/{TileMatrix}/{TileCol}/{TileRow}.png",
//       style: "default",
//       format: "image/png",
//       maximumLevel: 11,
//       layer: "",
//       tileMatrixSetID: "",
//       credit: new Credit("JHU-APL/CRISM"),
//     })
//   );
//   return h(ImageryLayer, { imageryProvider: ctx.current, ...props });
// };

const ImageryLayers = () => {
  const mapLayer = useSelector((s) => s.mapLayer);
  const overlays = useSelector((s) => s.overlayLayers);
  const visibleMaps = useSelector((s) => s.visibleMaps);
  const orientationOpts = useSelector((s) =>
    s.layerOptions.get(OverlayLayer.Orientations)
  );
  return h([
    h(ImageryLayerCollection, null, [
      h.if(overlays.has(OverlayLayer.HiRISEFootprints))(GeoJsonDataSource, {
        data: tileServerURL("/mosaic/hirise_red/assets"),
        //markerColor: Cesium.Color.RED,
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.RED.withAlpha(0.2),
        strokeWidth: 3,
        clampToGround: true,
      }),
      h.if(overlays.has(OverlayLayer.OrthophotoFooprints))(GeoJsonDataSource, {
        data: tileServerURL("/mosaic/orthoimage/assets"),
        //markerColor: Cesium.Color.GREEN,
        stroke: Cesium.Color.GREEN,
        fill: Cesium.Color.GREEN.withAlpha(0.2),
        strokeWidth: 3,
        clampToGround: true,
      }),
    ]),
    h(ImageryLayerCollection, null, [
      h.if(mapLayer == ActiveMapLayer.OpenPlanetaryHillshade)(MOLALayer),
      h.if(mapLayer == ActiveMapLayer.CTX)(ArcCTXLayer),
      h.if(mapLayer == ActiveMapLayer.ArcMDIM)(ArcMDIMLayer),
      h.if(mapLayer == ActiveMapLayer.Hillshade)(MarsHillshadeLayer),
    ]),
    h(ImageryLayerCollection, null, [
      h.if(overlays.has(OverlayLayer.HiRISE))(HiRISELayer),
      h.if(overlays.has(OverlayLayer.Ortho))(OrthoLayer),
      h.if(overlays.has(OverlayLayer.ArcHiRISE))(ArcHiRISELayer),
      h.if(overlays.has(OverlayLayer.Orientations))(
        OrientationsLayer,
        orientationOpts
      ),
    ]),
  ]);
};

export {
  ArcCTXLayer,
  MOLALayer,
  HiRISELayer,
  MarsHillshadeLayer,
  MarsTerrainProvider,
  ImageryLayers,
};
