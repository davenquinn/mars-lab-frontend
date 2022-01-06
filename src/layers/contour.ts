import { Material, Color } from "cesium";
import { useCesium } from "resium";
import { NumericInput, FormGroup, Collapse } from "@blueprintjs/core";
import { ExpandableControlsView } from "../controls";
import h from "../hyper";
// Code from Cesium js sandcastle

export interface ContourOptions {
  hasContour: boolean;
  contourWidth?: number;
  contourSpacing?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const defaultContourOptions = {
  hasContour: false,
  selectedShading: "none",
  contourWidth: 1.0,
  contourSpacing: 50,
  minHeight: -4000, // approximate dead sea elevation
  maxHeight: 15000, // approximate everest elevation
};

interface ContourControlsOptions {
  options: ContourOptions;
  setOptions(options: ContourOptions): void;
}

export function ContourControlsView({
  options = defaultContourOptions,
  setOptions,
}: ContourControlsOptions) {
  return h(
    ExpandableControlsView,
    {
      name: "Contours",
      active: options.hasContour,
      setActive() {
        setOptions({ ...options, hasContour: !options.hasContour });
      },
    },
    h(FormGroup, { inline: true, label: "Interval" }, [
      h(NumericInput, {
        placeholder: "Contour interval",
        value: options.contourSpacing,
        max: 1000,
        min: 5,
        onValueChange(value) {
          setOptions({ ...options, contourSpacing: value });
        },
      }),
    ])
  );
}

function getElevationContourMaterial() {
  // Creates a composite material with both elevation shading and contour lines
  return new Material({
    fabric: {
      type: "ElevationColorContour",
      materials: {
        contourMaterial: {
          type: "ElevationContour",
        },
        elevationRampMaterial: {
          type: "ElevationRamp",
        },
      },
      components: {
        diffuse:
          "contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse",
        alpha: "max(contourMaterial.alpha, elevationRampMaterial.alpha)",
      },
    },
    translucent: false,
  });
}

function getSlopeContourMaterial() {
  // Creates a composite material with both slope shading and contour lines
  return new Material({
    fabric: {
      type: "SlopeColorContour",
      materials: {
        contourMaterial: {
          type: "ElevationContour",
        },
        slopeRampMaterial: {
          type: "SlopeRamp",
        },
      },
      components: {
        diffuse:
          "contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse",
        alpha: "max(contourMaterial.alpha, slopeRampMaterial.alpha)",
      },
    },
    translucent: false,
  });
}

function getAspectContourMaterial() {
  // Creates a composite material with both aspect shading and contour lines
  return new Material({
    fabric: {
      type: "AspectColorContour",
      materials: {
        contourMaterial: {
          type: "ElevationContour",
        },
        aspectRampMaterial: {
          type: "AspectRamp",
        },
      },
      components: {
        diffuse:
          "contourMaterial.alpha == 0.0 ? aspectRampMaterial.diffuse : contourMaterial.diffuse",
        alpha: "max(contourMaterial.alpha, aspectRampMaterial.alpha)",
      },
    },
    translucent: false,
  });
}

var elevationRamp = [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0];
var slopeRamp = [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0];
var aspectRamp = [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0];
function getColorRamp(selectedShading) {
  var ramp = document.createElement("canvas");
  ramp.width = 100;
  ramp.height = 1;
  var ctx = ramp.getContext("2d");

  var values;
  if (selectedShading === "elevation") {
    values = elevationRamp;
  } else if (selectedShading === "slope") {
    values = slopeRamp;
  } else if (selectedShading === "aspect") {
    values = aspectRamp;
  }

  var grd = ctx.createLinearGradient(0, 0, 100, 0);
  grd.addColorStop(values[0], "#000000"); //black
  grd.addColorStop(values[1], "#2747E0"); //blue
  grd.addColorStop(values[2], "#D33B7D"); //pink
  grd.addColorStop(values[3], "#D33038"); //red
  grd.addColorStop(values[4], "#FF9742"); //orange
  grd.addColorStop(values[5], "#ffd700"); //yellow
  grd.addColorStop(values[6], "#ffffff"); //white

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 100, 1);

  return ramp;
}

var contourColor = Color.WHITE;
var contourUniforms = {};
var shadingUniforms = {};

export function useGlobeMaterial(opts: ContourOptions = defaultContourOptions) {
  const {
    hasContour,
    contourWidth,
    contourSpacing,
    minHeight, // approximate dead sea elevation
    maxHeight, // approximate everest elevation
  } = opts;
  const selectedShading = "none";
  const { viewer } = useCesium();
  var globe = viewer.scene.globe;
  var material;
  if (hasContour) {
    if (selectedShading === "elevation") {
      material = getElevationContourMaterial();
      shadingUniforms = material.materials.elevationRampMaterial.uniforms;
      shadingUniforms.minimumHeight = minHeight;
      shadingUniforms.maximumHeight = maxHeight;
      contourUniforms = material.materials.contourMaterial.uniforms;
    } else if (selectedShading === "slope") {
      material = getSlopeContourMaterial();
      shadingUniforms = material.materials.slopeRampMaterial.uniforms;
      contourUniforms = material.materials.contourMaterial.uniforms;
    } else if (selectedShading === "aspect") {
      material = getAspectContourMaterial();
      shadingUniforms = material.materials.aspectRampMaterial.uniforms;
      contourUniforms = material.materials.contourMaterial.uniforms;
    } else {
      material = Material.fromType("ElevationContour");
      contourUniforms = material.uniforms;
    }
    contourUniforms.width = contourWidth;
    contourUniforms.spacing = contourSpacing;
    contourUniforms.color = contourColor;
  } else if (selectedShading === "elevation") {
    material = Material.fromType("ElevationRamp");
    shadingUniforms = material.uniforms;
    shadingUniforms.minimumHeight = minHeight;
    shadingUniforms.maximumHeight = maxHeight;
  } else if (selectedShading === "slope") {
    material = Material.fromType("SlopeRamp");
    shadingUniforms = material.uniforms;
  } else if (selectedShading === "aspect") {
    material = Material.fromType("AspectRamp");
    shadingUniforms = material.uniforms;
  }
  if (selectedShading !== "none") {
    shadingUniforms.image = getColorRamp(selectedShading);
  }

  globe.material = material;
}
