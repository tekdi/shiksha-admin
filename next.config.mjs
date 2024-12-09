// next.config.mjs
/** @type {import('next').NextConfig} */
import nextI18nextConfig from "./next-i18next.config.js";
import { NextFederationPlugin } from "@module-federation/nextjs-mf";
const url = process.env.NEXT_PUBLIC_WORKSPACE_BASE_URL;
// const url = "http://localhost:3000";

const remotes = (isServer) => {
  const location = isServer ? "ssr" : "chunks";
  return {
    editor: `editor@${url}/_next/static/${location}/remoteEntry.js`,
  };
};

const PORTAL_BASE_URL = "https://sunbird-editor.tekdinext.com";

const routes = {
  API: {
    GENERAL: {
      CONTENT_PREVIEW: "/content/preview/:path*",
      CONTENT_PLUGINS: "/content-plugins/:path*",
      GENERIC_EDITOR: "/generic-editor/:path*",
    },
  },
};

const nextConfig = {
  eslint: {
    // Disabling on production builds because we're running checks on PRs via GitHub Actions.
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  i18n: nextI18nextConfig.i18n,

  distDir: "build",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
  async rewrites() {
    return [
      {
        source: "/action/asset/v1/upload/:identifier*", // Match asset upload routes
        destination: "/api/fileUpload", // Forward asset uploads to fileUpload proxy
      },
      {
        source: "/assets/pdfjs/:path*", // Match any URL starting with /workspace/content/assets/
        destination: `${process.env.WORKSPACE_BASE_URL}/assets/pdfjs/:path*`, // Serve the assets from the public folder
      },
      {
        source: "/play/content/assets/pdfjs/:path*", // Match any URL starting with /workspace/content/assets/
        destination: `${process.env.WORKSPACE_BASE_URL}/assets/pdfjs/:path*`, // Serve the assets from the public folder
      },
      {
        source: "/play/content/assets/:path*", // Match any URL starting with /workspace/content/assets/
        destination: `${process.env.WORKSPACE_BASE_URL}/assets/:path*`, // Serve the assets from the public folder
      },
      {
        source: "/action/content/v3/upload/url/:identifier*", // Match content upload with 'url' in the path
        destination: `${process.env.WORKSPACE_BASE_URL}/api/proxy?path=/action/content/v3/upload/url/:identifier*`, // Forward to proxy route with path as query param
      },
      {
        source: "/action/content/v3/upload/:identifier*", // Match content upload routes
        destination: "/api/fileUpload", // Forward asset uploads to fileUpload proxy
      },
      {
        source: "/workspace/content/assets/:path*", // Match any URL starting with /workspace/content/assets/
        destination: `${process.env.WORKSPACE_BASE_URL}/assets/:path*`, // Serve the assets from the public folder
      },
      {
        source: "/action/asset/:path*", // Match other /action/asset routes
        destination: `${process.env.WORKSPACE_BASE_URL}/api/proxy?path=/action/asset/:path*`, // Forward other /action/asset requests to proxy.js
      },
      {
        source: "/action/v1/telemetry",
        destination: `${process.env.NEXT_PUBLIC_TELEMETRY_URL}/v1/telemetry`,
      },
      {
        source: "/action/content/:path*", // Match other /action/asset routes
        destination: `${process.env.WORKSPACE_BASE_URL}/api/proxy?path=/action/content/:path*`, // Forward other /action/asset requests to proxy.js
      },
      {
        source: "/action/:path*", // Match any other routes starting with /action/
        destination: `${process.env.WORKSPACE_BASE_URL}/api/proxy?path=/action/:path*`, // Forward them to proxy.js
      },
      {
        source: "/api/:path*", // Match /api/ routes
        destination: `${process.env.WORKSPACE_BASE_URL}/api/proxy?path=/api/:path*`, // Forward them to proxy.js
      },
      {
        source: "/assets/public/:path*", // Match any URL starting with /assets/public/
        destination: `${process.env.CLOUD_STORAGE_URL}/:path*`, // Forward to workspace proxy
      },
      {
        source: routes.API.GENERAL.CONTENT_PREVIEW,
        destination: `${PORTAL_BASE_URL}${routes.API.GENERAL.CONTENT_PREVIEW}`, // Proxy to portal
      },
      {
        source: routes.API.GENERAL.CONTENT_PLUGINS,
        destination: `${PORTAL_BASE_URL}${routes.API.GENERAL.CONTENT_PLUGINS}`, // Proxy to portal
      },
      {
        source: routes.API.GENERAL.GENERIC_EDITOR,
        destination: `${PORTAL_BASE_URL}/:path*`, // Proxy to generic editor portal
      },
      {
        source: "/app/telemetry", // Match telemetry route
        destination: `${process.env.WORKSPACE_BASE_URL}/api/telemetry`, // Redirect to telemetry proxy
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.plugins.push(
      new NextFederationPlugin({
        name: "admin",
        filename: "static/chunks/remoteEntry.js",
        remotes: remotes(isServer),
        exposes: {},
      })
    );
    return config;
  },
};

export default nextConfig;
