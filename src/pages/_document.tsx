// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
     <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tekdi/sunbird-questionset-editor-web-component@3.0.1/styles.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/@tekdi/sunbird-questionset-editor-web-component@3.0.1/sunbird-questionset-editor.js"
          async
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
