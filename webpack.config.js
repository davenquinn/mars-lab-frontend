const path = require("path");
const { DefinePlugin, EnvironmentPlugin } = require("webpack");
//UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const historyApiFallback = require("connect-history-api-fallback");
const CopyPlugin = require("copy-webpack-plugin");
const DotenvPlugin = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const pkg = require("./package.json");

let mode = process.env.NODE_ENV || "development";

const outputDir = process.env.BUNDLE_DIR || path.join(__dirname, "dist");

const gitRevisionPlugin = new GitRevisionPlugin({
  lightweightTags: true,
  commithashCommand: "rev-parse --short HEAD",
});
const GITHUB_LINK = "https://github.com/davenquinn/ne-syrtis-jezero-viewer";

const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
const cesiumBase = (process.env.PUBLIC_URL || "") + "/";

//uglify = new UglifyJsPlugin()

const cssModuleLoader = {
  loader: "css-loader",
  options: {
    modules: {
      mode: "local",
      localIdentName: "[path][name]__[local]--[hash:base64:5]",
    },
  },
};

let exclude = /node_modules/;

module.exports = {
  mode: mode,
  devServer: {
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
  devtool: "source-map",
  module: {
    unknownContextCritical: false,
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: ["babel-loader"],
        exclude,
      },
      {
        test: /\.styl$/,
        use: ["style-loader", cssModuleLoader, "stylus-loader"],
        exclude,
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      { test: /\.css$/, use: ["style-loader", cssModuleLoader], exclude },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {},
          },
        ],
      },
      {
        test: /\.(png|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              useRelativePath: true,
              outputPath: "sections/assets/",
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      // CesiumJS module name
      cesium: path.resolve(__dirname, "node_modules", "cesium"),
      cesiumSource: path.resolve(__dirname, cesiumSource),
      "cesium-viewer": path.resolve(
        __dirname,
        "packages",
        "cesium-viewer",
        "src"
      ),
      "@macrostrat/cesium-vector-provider": path.resolve(
        __dirname,
        "packages",
        "cesium-vector-provider",
        "src"
      ),
      "~": path.resolve(__dirname, "src"),
    },
    // Fallback to buffer
    fallback: { buffer: false },
  },
  entry: {
    index: "./src/index.ts",
  },
  output: {
    path: outputDir,
    filename: "[name].js",
    sourcePrefix: "",
  },
  amd: {
    // Enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
        { from: path.join(cesiumSource, "Assets"), to: "Assets" },
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
      ],
    }),
    new HtmlWebpackPlugin({ title: "Mars Lab" }),
    new EnvironmentPlugin({
      PUBLIC_URL: "/",
      MAPBOX_API_TOKEN: "",
    }),
    new DefinePlugin({
      GITHUB_LINK: JSON.stringify(GITHUB_LINK),
      CESIUM_BASE_URL: JSON.stringify(cesiumBase),
      NPM_VERSION: JSON.stringify(pkg.version),
      GIT_VERSION: JSON.stringify(gitRevisionPlugin.version()),
      GIT_COMMIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
      COMPILE_DATE: JSON.stringify(
        new Date().toLocaleString("en-US", { month: "long", year: "numeric" })
      ),
      GITHUB_REV_LINK: JSON.stringify(
        GITHUB_LINK + "/tree/" + gitRevisionPlugin.commithash()
      ),
      GITHUB_LINK,
    }),
    new DotenvPlugin({ defaults: true }),
  ],
};
