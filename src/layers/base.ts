import { useRef } from "react";
import {
  Credit,
  UrlTemplateImageryProvider,
  GeographicTilingScheme,
  WebMapTileServiceImageryProvider,
} from "cesium";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import { GeoLayerProps } from "cesium-viewer/layers";

export function ArcGISAstroImageryProvider(props: GeoLayerProps) {
  const { layerID, credit = "USGS / ESRI", ...rest } = props;
  let ctx = useRef(
    new UrlTemplateImageryProvider({
      url: `https://astro.arcgis.com/arcgis/rest/services/OnMars/${layerID}/MapServer/tile/{z}/{y}/{x}?blankTile=false`,
      style: "default",
      format: "image/png",
      tileWidth: 512,
      tileHeight: 512,
      maximumLevel: 14,
      layer: "",
      tileMatrixSetID: "",
      tilingScheme: new GeographicTilingScheme(),
      credit: new Credit(credit),
      ...rest,
    })
  );

  return h(ImageryLayer, { imageryProvider: ctx.current, ...rest });
}

export function BaseImageryLayer(
  props: GeoLayerProps & { url: string; credit: string }
) {
  const { url, credit, ...rest } = props;
  let _credit: any = null;
  if (credit != null) {
    _credit = new Credit(credit);
  }
  let ctx = useRef(
    new WebMapTileServiceImageryProvider({
      url,
      style: "default",
      format: "image/png",
      maximumLevel: 18,
      layer: "",
      tileMatrixSetID: "",
      credit: _credit,
    })
  );
  return h(ImageryLayer, {
    imageryProvider: ctx.current,
    ...rest,
  });
}

export enum RasterLayer {
  HiRISE = "hirise",
  Ortho = "ortho",
  ArcHiRISE = "arc-hirise",
  ArcOrtho = "arc-ortho",
  CRISM = "crism",
  Geology = "geology",
  Rover = "rover",
}

export enum VectorLayer {
  HiRISEFootprints = "hirise-footprints",
  OrthophotoFooprints = "orthophotos",
  Orientations = "orientations",
}

export const OverlayLayer = { ...RasterLayer, ...VectorLayer };
export type OverlayLayer = RasterLayer & VectorLayer;
