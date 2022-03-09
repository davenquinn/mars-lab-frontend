import { ReactNode, useRef } from "react";
import {
  Credit,
  UrlTemplateImageryProvider,
  GeographicTilingScheme,
  WebMapTileServiceImageryProvider,
} from "cesium";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import { GeoLayerProps } from "cesium-viewer/layers";
import { useSelector, useDispatch } from "../state";
import { ExpandableControlsView } from "../controls";

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

export enum OverlayLayer {
  HiRISE = "hirise",
  Ortho = "ortho",
  ArcHiRISE = "arc-hirise",
  ArcOrtho = "arc-ortho",
  CRISM = "crism",
  Geology = "geology",
  Rover = "rover",
  HiRISEFootprints = "hirise-footprints",
  OrthophotoFooprints = "orthophotos",
  Orientations = "orientations",
  Contour = "contour",
}

export function useIsActive(lyr) {
  const overlays = useSelector((s) => s.overlayLayers);
  return overlays.has(lyr);
}

export function ExpandableLayerControl({
  layer,
  name,
  children,
}: {
  layer: OverlayLayer;
  name: string;
  children: ReactNode;
}) {
  const dispatch = useDispatch();
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
    children
  );
}
