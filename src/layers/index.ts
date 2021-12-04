import { useRef } from "react";
import { Credit, TileMapServiceImageryProvider } from "cesium";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import {
  GeoLayerProps,
  MarsHillshadeLayer,
  //MapboxVectorTileImageryProvider,
} from "cesium-viewer/layers";
import MapboxTerrainProvider, {
  TileCoordinates,
} from "@macrostrat/cesium-martini";
import SphericalMercator from "@mapbox/sphericalmercator";
const Cesium: any = require("cesiumSource/Cesium");
import { ImageryLayerCollection, GeoJsonDataSource } from "resium";
import { ActiveMapLayer } from "cesium-viewer/actions";
import { useSelector } from "react-redux";
import { ArcGISAstroImageryProvider, BaseImageryLayer } from "./base";

export enum OverlayLayer {
  HiRISE = "hirise",
  Ortho = "ortho",
  ArcHiRISE = "arc-hirise",
  ArcOrtho = "arc-ortho",
  CRISM = "crism",
  Geology = "geology",
  Rover = "rover",
}

const MARS_RADIUS_SCALAR = 3390 / 6371;

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
    url: `https://argyre.geoscience.wisc.edu/tiles/mosaic/hirise_red/tiles/{TileMatrix}/{TileCol}/{TileRow}.png`,
    credit: "USGS/HiRISE",
    colorToAlpha: Cesium.Color.BLACK,
    tileWidth: 256,
    tileHeight: 256,
  });
};

const OrthoLayer = (props: GeoLayerProps) => {
  return h(BaseImageryLayer, {
    url: `https://argyre.geoscience.wisc.edu/tiles/mosaic/orthoimage/tiles/{TileMatrix}/{TileCol}/{TileRow}.png?rescale=0,255`,
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

class MarsTerrainProvider extends MapboxTerrainProvider {
  RADIUS_SCALAR = MARS_RADIUS_SCALAR;
  meshErrorScalar = 1;
  levelOfDetailScalar = 8;
  credit = new Credit(
    "University of Arizona - HiRISE, CTX, PDS Imaging Node, HRSC Mission Team"
  );

  constructor(opts = {}) {
    super({ ...opts, highResolution: false });
  }

  buildTileURL(tileCoords: TileCoordinates) {
    const { z, x, y } = tileCoords;
    const hires = this.highResolution ? "@2x" : "";
    return `https://argyre.geoscience.wisc.edu/tiles/elevation-mosaic/tiles/${z}/${x}/${y}${hires}.png?resampling_method=bilinear`;
  }

  getTileDataAvailable(x, y, z) {
    // const [w, s, e, n] = merc.bbox(x, y, z);
    // if (e < bounds.w || w > bounds.e || n < bounds.s || s > bounds.n)
    //   return false;
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
  return h([
    h(ImageryLayerCollection, null, [
      h(GeoJsonDataSource, {
        data: "https://argyre.geoscience.wisc.edu/tiles/mosaic/hirise_red/assets",
        markerColor: Cesium.Color.RED,
        stroke: Cesium.Color.RED,
        clampToGround: true,
      }),
      h(GeoJsonDataSource, {
        data: "https://argyre.geoscience.wisc.edu/tiles/mosaic/orthophoto/assets",
        markerColor: Cesium.Color.GREEN,
        stroke: Cesium.Color.GREEN,
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
