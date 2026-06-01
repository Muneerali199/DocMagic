if (!self.define) {
  let e,
    a = {};
  const s = (s, i) => (
    (s = new URL(s + ".js", i).href),
    a[s] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, c) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[t]) return;
    let n = {};
    const r = (e) => s(e, t),
      d = { module: { uri: t }, exports: n, require: r };
    a[t] = Promise.all(i.map((e) => d[e] || r(e))).then((e) => (c(...e), n));
  };
}
define(["./workbox-f52fd911"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: "/404.html", revision: "aa304d50ea8fa3b2f55fa6fdfaae2c7f" },
        {
          url: "/AltaCV_Template.pdf",
          revision: "e7a05f7f12e832ca4a9727c920471354",
        },
        {
          url: "/Beige and Black Minimalist Project Deck Presentation.pdf",
          revision: "847a024b3bf0553973df9b929f013240",
        },
        {
          url: "/Black Elegant and Modern Startup Pitch Deck Presentation.pdf",
          revision: "94337e153e8334b6bf006a43247278d2",
        },
        {
          url: "/Black and Grey 3D Shapes Tech Company Presentation.pdf",
          revision: "d04ceba206e9d4902baaf9df605037dd",
        },
        {
          url: "/Black and White Clean Professional A4 Resume.pdf",
          revision: "ea1d19c17897bd0db295b12d1c35a976",
        },
        {
          url: "/Blue and Black Geometric Creative Resume.pdf",
          revision: "8cde79bb8fecfbc8249eb1123f32d6e5",
        },
        {
          url: "/Blue and Green Modern Artificial Intelligence Presentation.pdf",
          revision: "a1d9c714c689209e252a28a63ce34e52",
        },
        {
          url: "/Blue and White Modern Artificial Intelligence Presentation.pdf",
          revision: "6fb55121724883556a3fc93489b472af",
        },
        {
          url: "/Blue and White Modern Professional Resume.pdf",
          revision: "4549b23338f5ae0d216f17cb47de8fe1",
        },
        {
          url: "/Deedy_Resume_Reversed.pdf",
          revision: "01a9a8df935ec5aa217f91ca205543e6",
        },
        {
          url: "/IT Manager CV Resume.pdf",
          revision: "d49942cba0b4c90ad1f23b77ed7c0519",
        },
        {
          url: "/NIT_Patna_Resume_Template_v2_1.pdf",
          revision: "7e8f51e36af815d9ebd442bf75e4044e",
        },
        {
          url: "/Software_Engineering_Resume.pdf",
          revision: "439316c97885c787be8d575d4f6317ff",
        },
        {
          url: "/White Blue Simple Modern Enhancing Sales Strategy Presentation.pdf",
          revision: "dd21eeee9010ed518acb0579b888bf7c",
        },
        {
          url: "/_next/app-build-manifest.json",
          revision: "ee7786e1078674d16413893d88cf57ab",
        },
        {
          url: "/_next/static/chunks/5343.893b21309f27be8d.js",
          revision: "893b21309f27be8d",
        },
        {
          url: "/_next/static/chunks/5343.893b21309f27be8d.js.map",
          revision: "cf4989232d114045886250f0f8858986",
        },
        {
          url: "/_next/static/chunks/794.06990c9c4fec4b76.js",
          revision: "06990c9c4fec4b76",
        },
        {
          url: "/_next/static/chunks/794.06990c9c4fec4b76.js.map",
          revision: "bc5ec652eea2ee3b03498735f10ca05c",
        },
        {
          url: "/_next/static/chunks/8219.00d1530574322eb5.js",
          revision: "00d1530574322eb5",
        },
        {
          url: "/_next/static/chunks/8219.00d1530574322eb5.js.map",
          revision: "ac29905f833390a5a158ee77eb85e584",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-44fa3ddb0b973bc2.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/about/page-92f29c52f30c5e40.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/about/page-92f29c52f30c5e40.js.map",
          revision: "00b5a6a61bc74289aaa0f4d5e2cbb124",
        },
        {
          url: "/_next/static/chunks/app/auth/forgot-password/page-4e7ba243a939eb55.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/auth/forgot-password/page-4e7ba243a939eb55.js.map",
          revision: "59d542d3b5be4ef21922c7d8af466c39",
        },
        {
          url: "/_next/static/chunks/app/auth/register/page-ae70a6ca502a6d30.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/auth/register/page-ae70a6ca502a6d30.js.map",
          revision: "69c991902debd82bd87f71c472951b8d",
        },
        {
          url: "/_next/static/chunks/app/auth/reset-password/page-80c2bf6f46a2037b.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/auth/reset-password/page-80c2bf6f46a2037b.js.map",
          revision: "7cd4409cfd941ea02ef2d3914f995972",
        },
        {
          url: "/_next/static/chunks/app/auth/signin/page-fad72aed20ef34a2.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/auth/signin/page-fad72aed20ef34a2.js.map",
          revision: "34dbe30af4dd47c1e9d61de148406c6d",
        },
        {
          url: "/_next/static/chunks/app/contact/page-979a39ac3b122512.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/contact/page-979a39ac3b122512.js.map",
          revision: "72a991a72b9b2e3a65818d56632536f8",
        },
        {
          url: "/_next/static/chunks/app/cv/page-047dfa19ebe2f2f1.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/cv/page-047dfa19ebe2f2f1.js.map",
          revision: "4bcfbebd6ba6ea125cbc636d0fc4d152",
        },
        {
          url: "/_next/static/chunks/app/dashboard/analytics/page-de56bab1991ca0da.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/dashboard/analytics/page-de56bab1991ca0da.js.map",
          revision: "e412f6eacba89b87858b869fd3d9062e",
        },
        {
          url: "/_next/static/chunks/app/dashboard/export/page-c11edc187b67b704.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/dashboard/export/page-c11edc187b67b704.js.map",
          revision: "2941da9cc1f409149597feb9d77b9685",
        },
        {
          url: "/_next/static/chunks/app/dashboard/history/page-67b846b5cd909286.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/dashboard/history/page-67b846b5cd909286.js.map",
          revision: "a214d500be3faf0c10de95898bfa439a",
        },
        {
          url: "/_next/static/chunks/app/diagnostic/page-93018550e10fda4b.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/diagram/page-3e089d1f730f9f6f.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/diagram/page-3e089d1f730f9f6f.js.map",
          revision: "3b84e22fd751279cfd1e3b3aa80e27e9",
        },
        {
          url: "/_next/static/chunks/app/documentation/page-013e9dfcdb668e4f.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/documents/%5Bid%5D/page-c82b3ad05320c3f5.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/documents/%5Bid%5D/page-c82b3ad05320c3f5.js.map",
          revision: "706994d04eafb01f672865b2cee923ef",
        },
        {
          url: "/_next/static/chunks/app/documents/page-f84dbd372e7d46e1.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/documents/page-f84dbd372e7d46e1.js.map",
          revision: "46a20a0263e84a153146f447302a5b3e",
        },
        {
          url: "/_next/static/chunks/app/editor/%5Btype%5D/%5Bid%5D/page-712b548111ecb3e1.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/editor/%5Btype%5D/%5Bid%5D/page-712b548111ecb3e1.js.map",
          revision: "cad013a3cc47423e1a6b1f7904ce8218",
        },
        {
          url: "/_next/static/chunks/app/editor/page-685fdcfd95bcae40.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/editor/page-685fdcfd95bcae40.js.map",
          revision: "cdeea8d4e9dfd21eb1ba3333827d2f9e",
        },
        {
          url: "/_next/static/chunks/app/error-e2c6aa75c4336f47.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/error-e2c6aa75c4336f47.js.map",
          revision: "4ac3062fb5dc2bf6b81d59955c8f17ae",
        },
        {
          url: "/_next/static/chunks/app/global-error-4707e4472f1f16ac.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/global-error-4707e4472f1f16ac.js.map",
          revision: "353dda0b1c9fbb90292d31ed691ad0f0",
        },
        {
          url: "/_next/static/chunks/app/layout-11935b5e3ab7f0e6.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/layout-11935b5e3ab7f0e6.js.map",
          revision: "7765cdd8e5b9a9477fde14d1db0871db",
        },
        {
          url: "/_next/static/chunks/app/letter/cover-letter-from-resume/page-fd5335dafb3de18e.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/letter/cover-letter-from-resume/page-fd5335dafb3de18e.js.map",
          revision: "d097834ce9de96fe83df1666e98836a0",
        },
        {
          url: "/_next/static/chunks/app/letter/page-029cfdd9edbcf6eb.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/letter/page-029cfdd9edbcf6eb.js.map",
          revision: "1486ea1e386cb763c1795d77df5f1154",
        },
        {
          url: "/_next/static/chunks/app/not-found-4333b4dbc6e25958.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/not-found-4333b4dbc6e25958.js.map",
          revision: "e2fded020092ae6f05ba4f27dd10eccd",
        },
        {
          url: "/_next/static/chunks/app/p/%5Bid%5D/page-06f352533aef9980.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/p/%5Bid%5D/page-06f352533aef9980.js.map",
          revision: "634e930da77d0f2e3fb8a34c048e65e1",
        },
        {
          url: "/_next/static/chunks/app/page-a5d5e31043f8082b.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/page-a5d5e31043f8082b.js.map",
          revision: "4b48ba43fafc5c561f6143c579f587ef",
        },
        {
          url: "/_next/static/chunks/app/presentation/mobile/page-022c76381d44ce5e.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/presentation/mobile/page-022c76381d44ce5e.js.map",
          revision: "ac853382ef98af2f260f3fe58c143693",
        },
        {
          url: "/_next/static/chunks/app/presentation/page-359ee9bf18250e7d.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/presentation/page-359ee9bf18250e7d.js.map",
          revision: "4eb55817cbe005547ab3ccb559ef3733",
        },
        {
          url: "/_next/static/chunks/app/presentation/view/%5Bid%5D/page-9873c4cf1cfac9c7.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/presentation/view/%5Bid%5D/page-9873c4cf1cfac9c7.js.map",
          revision: "595dcf365d1827461aa93a61a7e4900f",
        },
        {
          url: "/_next/static/chunks/app/pricing/page-202ada3aafdb9126.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/pricing/page-202ada3aafdb9126.js.map",
          revision: "8d0579f1b01d480ea21700ffb6590988",
        },
        {
          url: "/_next/static/chunks/app/profile/page-586abf054394cd91.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/profile/page-586abf054394cd91.js.map",
          revision: "ad9ce45e9e6ab40ad1c04a93f7d39721",
        },
        {
          url: "/_next/static/chunks/app/r/%5Bsubdomain%5D/page-fa1fd40f6b497acc.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/r/%5Bsubdomain%5D/page-fa1fd40f6b497acc.js.map",
          revision: "5eda48f9818c458c6caded9b416071f0",
        },
        {
          url: "/_next/static/chunks/app/resume-builder-simple/page-17d34f26fca14275.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/resume-builder-simple/page-17d34f26fca14275.js.map",
          revision: "efe7d9bd81d8e549c3cef9e2756434b4",
        },
        {
          url: "/_next/static/chunks/app/resume-builder/page-46450b0722dfbcee.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/resume-builder/page-46450b0722dfbcee.js.map",
          revision: "889cca063d74f92f8d84d346b4850f63",
        },
        {
          url: "/_next/static/chunks/app/resume-editor/page-d2ef7ccfc9c1002e.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/resume-editor/page-d2ef7ccfc9c1002e.js.map",
          revision: "dcc33f7d59e1fa1acccf15c2642f2823",
        },
        {
          url: "/_next/static/chunks/app/resume/ats/page-641dd239c7832267.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/resume/ats/page-641dd239c7832267.js.map",
          revision: "6fb46c0b09fdaf7887182ae9697baeb8",
        },
        {
          url: "/_next/static/chunks/app/resume/page-d5f3f052cb65a535.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/resume/page-d5f3f052cb65a535.js.map",
          revision: "5bc1ecd346701ad33dd7eff28eebc24b",
        },
        {
          url: "/_next/static/chunks/app/settings/layout-b21d8cbda5b06b31.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/settings/layout-b21d8cbda5b06b31.js.map",
          revision: "b8c386b32b4b6e61127c50845d5bdcc6",
        },
        {
          url: "/_next/static/chunks/app/settings/page-0c6d38606fd59c3a.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/settings/page-0c6d38606fd59c3a.js.map",
          revision: "31ae861f9e73c91888d1538065833899",
        },
        {
          url: "/_next/static/chunks/app/showcase/page-6b6bf71f71810828.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/showcase/page-6b6bf71f71810828.js.map",
          revision: "a41cdb82ea76d72fdc286993d07a8f13",
        },
        {
          url: "/_next/static/chunks/app/subscription/page-5f55e9904ef46df4.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/subscription/page-5f55e9904ef46df4.js.map",
          revision: "490546f01105b784f2d4be7c8c0335be",
        },
        {
          url: "/_next/static/chunks/app/subscription/success/page-372b9f92ecd90385.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/subscription/success/page-372b9f92ecd90385.js.map",
          revision: "ff1292cf86b1317f2834159571e8396a",
        },
        {
          url: "/_next/static/chunks/app/templates/%5Bid%5D/edit/layout-82d8f42f17ecdce5.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/%5Bid%5D/edit/page-eaa129c5622e5e7f.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/%5Bid%5D/edit/page-eaa129c5622e5e7f.js.map",
          revision: "77e733458c8890b128f8623ec397e4a3",
        },
        {
          url: "/_next/static/chunks/app/templates/%5Bid%5D/use/page-80ceb37e64810e11.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/%5Bid%5D/use/page-80ceb37e64810e11.js.map",
          revision: "76ad2adca8ae5f6ba65f3238a9fcfc7f",
        },
        {
          url: "/_next/static/chunks/app/templates/enhanced/page-df9f688828a3b4d8.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/enhanced/page-df9f688828a3b4d8.js.map",
          revision: "afbbecfaa07c67dc4499e28ae64fbf66",
        },
        {
          url: "/_next/static/chunks/app/templates/layout-db1b63f715d138a0.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/new/page-bb88d825e7998e2d.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/new/page-bb88d825e7998e2d.js.map",
          revision: "64ca43b0dee241d313973beae2b7770c",
        },
        {
          url: "/_next/static/chunks/app/templates/page-fe774a0aba775c39.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/app/templates/page-fe774a0aba775c39.js.map",
          revision: "0075453d9ddb2377b4553a86503528cb",
        },
        {
          url: "/_next/static/chunks/app/test-ats/page-4b534e259eb3aab8.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/commons-853858e6493ec819.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/commons-853858e6493ec819.js.map",
          revision: "fd1f80f8b3cbc4dcc6cf1f0677cef232",
        },
        {
          url: "/_next/static/chunks/framework-227e0a62a8dfdd3a.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/framework-227e0a62a8dfdd3a.js.map",
          revision: "6b9dd80970c8a8fbd49ad28e1bab5c09",
        },
        {
          url: "/_next/static/chunks/main-8dc19947c1a0c85d.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/main-app-598c4930ed5e30bc.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/main-app-598c4930ed5e30bc.js.map",
          revision: "d79dd9244e7b7128f3846c4b5ec807a2",
        },
        {
          url: "/_next/static/chunks/pages/_app-9289a28863ed9e1c.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/pages/_app-9289a28863ed9e1c.js.map",
          revision: "e686e91c0c7e2219586424b9baf0d6a4",
        },
        {
          url: "/_next/static/chunks/pages/_error-406ea7f8e837ff31.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/pages/_error-406ea7f8e837ff31.js.map",
          revision: "e66211eb92ec88c19055610fa5ccd2b0",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-5d4748a62ea5899e.js",
          revision: "zBJmwOVsZLVMqu2Y9YFVP",
        },
        {
          url: "/_next/static/chunks/webpack-5d4748a62ea5899e.js.map",
          revision: "b47b7d328a289b7016dadac9edc16107",
        },
        {
          url: "/_next/static/css/349ce08d65061ed8.css",
          revision: "349ce08d65061ed8",
        },
        {
          url: "/_next/static/css/349ce08d65061ed8.css.map",
          revision: "0ebb63c4526e4b3144a7d601e341f206",
        },
        {
          url: "/_next/static/css/5a9626498530b8a6.css",
          revision: "5a9626498530b8a6",
        },
        {
          url: "/_next/static/css/5a9626498530b8a6.css.map",
          revision: "220636b6e122f3fc226408f97b8a7b64",
        },
        {
          url: "/_next/static/css/ad47933301485a57.css",
          revision: "ad47933301485a57",
        },
        {
          url: "/_next/static/css/ad47933301485a57.css.map",
          revision: "ae76983e30cbebcfd9f70fcee14e180f",
        },
        {
          url: "/_next/static/media/034d78ad42e9620c-s.woff2",
          revision: "be7c930fceb794521be0a68e113a71d8",
        },
        {
          url: "/_next/static/media/0484562807a97172-s.p.woff2",
          revision: "b550bca8934bd86812d1f5e28c9cc1de",
        },
        {
          url: "/_next/static/media/19cfc7226ec3afaa-s.woff2",
          revision: "9dda5cfc9a46f256d0e131bb535e46f8",
        },
        {
          url: "/_next/static/media/21350d82a1f187e9-s.woff2",
          revision: "4e2553027f1d60eff32898367dd4d541",
        },
        {
          url: "/_next/static/media/28485c0de2075f40-s.woff2",
          revision: "58f1bb271968fc16131cba266fce1376",
        },
        {
          url: "/_next/static/media/29a4aea02fdee119-s.woff2",
          revision: "69d9d2cdadeab7225297d50fc8e48e8b",
        },
        {
          url: "/_next/static/media/29e7bbdce9332268-s.woff2",
          revision: "9e3ecbe4bb4c6f0b71adc1cd481c2bdc",
        },
        {
          url: "/_next/static/media/4c285fdca692ea22-s.p.woff2",
          revision: "42d3308e3aca8742731f63154187bdd7",
        },
        {
          url: "/_next/static/media/5fb25f343c7550ca-s.woff2",
          revision: "b1ee7ba0b4c946e20d7859cddf2aa203",
        },
        {
          url: "/_next/static/media/6c177e25b87fd9cd-s.woff2",
          revision: "4f9434d4845212443bbd9d102f1f5d7d",
        },
        {
          url: "/_next/static/media/6c9a125e97d835e1-s.woff2",
          revision: "889718d692d5bfc6019cbdfcb5cc106f",
        },
        {
          url: "/_next/static/media/7db6c35d839a711c-s.p.woff2",
          revision: "de2b6fe4e663c0669007e5b501c2026b",
        },
        {
          url: "/_next/static/media/8888a3826f4a3af4-s.p.woff2",
          revision: "792477d09826b11d1e5a611162c9797a",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/a1386beebedccca4-s.woff2",
          revision: "d3aa06d13d3cf9c0558927051f3cb948",
        },
        {
          url: "/_next/static/media/b957ea75a84b6ea7-s.p.woff2",
          revision: "0bd523f6049956faaf43c254a719d06a",
        },
        {
          url: "/_next/static/media/ba9851c3c22cd980-s.woff2",
          revision: "9e494903d6b0ffec1a1e14d34427d44d",
        },
        {
          url: "/_next/static/media/c3bc380753a8436c-s.woff2",
          revision: "5a1b7c983a9dc0a87a2ff138e07ae822",
        },
        {
          url: "/_next/static/media/c5fe6dc8356a8c31-s.woff2",
          revision: "027a89e9ab733a145db70f09b8a18b42",
        },
        {
          url: "/_next/static/media/db911767852bc875-s.woff2",
          revision: "9516f567cd80b0f418bba2f1299ed6d1",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        {
          url: "/_next/static/media/eafabf029ad39a43-s.p.woff2",
          revision: "43751174b6b810eb169101a20d8c26f8",
        },
        {
          url: "/_next/static/media/f10b8e9d91f3edcb-s.woff2",
          revision: "63af7d5e18e585fad8d0220e5d551da1",
        },
        {
          url: "/_next/static/media/fe0777f1195381cb-s.woff2",
          revision: "f2a04185547c36abfa589651236a9849",
        },
        {
          url: "/_next/static/zBJmwOVsZLVMqu2Y9YFVP/_buildManifest.js",
          revision: "f4bb6d83708f27fcb73f44931a5c6496",
        },
        {
          url: "/_next/static/zBJmwOVsZLVMqu2Y9YFVP/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/android-chrome-192x192.png",
          revision: "d874e1e39eb3cc438593bb42c88938ca",
        },
        {
          url: "/android-chrome-512x512.png",
          revision: "fe56c1cb0269432f0c1f13b850582c65",
        },
        {
          url: "/apple-touch-icon.png",
          revision: "b8af194e26703c7079d0a83aa212171a",
        },
        { url: "/autoCV.pdf", revision: "318064e7d0cfb9e957459c1594870b40" },
        {
          url: "/browserconfig.xml",
          revision: "30c7201d451e830c693ef2b96acd4974",
        },
        { url: "/clear-auth.js", revision: "ed3e2688db5e55e16b67287d9504705a" },
        {
          url: "/docs/PAYMENT_METHODS_SETUP.md",
          revision: "625ac5e5aec2e97d85e99c53d3b53e8b",
        },
        {
          url: "/draftdeckai-logo.svg",
          revision: "990bf61721d9eee3a4c72a5ba10b2b48",
        },
        {
          url: "/favicon-16x16.png",
          revision: "a0b9920e22d2d5a5c78ad497ecaca8e8",
        },
        {
          url: "/favicon-32x32.png",
          revision: "5bf2c36a5ea0807fbb1a50f1934f97bb",
        },
        { url: "/favicon.ico", revision: "874ad6d364dbdf5f95e5d450329c0ec2" },
        { url: "/magic-hat.svg", revision: "43b45a49b58e725dd8d7f36ad7287f26" },
        { url: "/manifest.json", revision: "e63f05e8c6d414dbca7779188b4e29f6" },
        { url: "/offline.html", revision: "47d4b0aa8442054557076ce0926214f1" },
        { url: "/og-image.png", revision: "907288358f2a45bc0fc8e1d908566d2b" },
        {
          url: "/resume-nav-fix.js",
          revision: "cdee672876c9666f23b3aacfb65ba623",
        },
        {
          url: "/templates/previews/altacv.png",
          revision: "51e8a75ca8741392f116950d8f293520",
        },
        {
          url: "/templates/previews/autocv.png",
          revision: "c36aec08bcc2935b40eb8ddf21af5f85",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-1.png",
          revision: "3bdad5666e7936d9c966949422ed4c7a",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-10.png",
          revision: "d68a41806844998c5a387536994334b1",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-2.png",
          revision: "4c3915f8ca53dcd92d47914e8c196f2e",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-3.png",
          revision: "b8d430ca122221e2f5af6671162b031d",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-4.png",
          revision: "121d6b5a244cd41f153cf489f1509341",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-5.png",
          revision: "662bb593a6ccf25f35c71c5ae8822c42",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-6.png",
          revision: "d84633f91c93cdfe58e1d5581745820c",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-7.png",
          revision: "4a6fe1b6a09660b9db64d30acf9cf32b",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-8.png",
          revision: "5de5c316072374394a5ae3dc5b3f5373",
        },
        {
          url: "/templates/previews/beige-black-minimalist-project-slide-9.png",
          revision: "0d53175bf4574cd8ed1f6cbc37fb9942",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-1.png",
          revision: "398a89112d331064dc276ed1c36f9ea1",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-10.png",
          revision: "e79a8a6f5d4050adda74910093f2fc52",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-11.png",
          revision: "015e96badef890ae913f5e084df08aa8",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-12.png",
          revision: "cbfd792a155a8b7c61ce216127696df8",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-13.png",
          revision: "2f37b7e276e727ebeb22395fa349da6e",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-14.png",
          revision: "b2a46adcd298f66b04ac7989399652cc",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-15.png",
          revision: "5d2b870e6cab4f3a1156fdd87cc76e5f",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-2.png",
          revision: "a2c82d65a5a377efb1cd299b89c61291",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-3.png",
          revision: "580a41384980b7fbfbc9328b2f01b3ff",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-4.png",
          revision: "37fe57d48a4127b499c1b40fdd5e5a43",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-5.png",
          revision: "99a1162ec1a52ff04d7fe61e1f14d150",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-6.png",
          revision: "7b38fa1b4075319cd37e4697cdbc6fce",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-7.png",
          revision: "b7b2d92411b73581ccb27320e69eddc0",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-8.png",
          revision: "33380082089cf7dc59cbe39410cbf4bf",
        },
        {
          url: "/templates/previews/black-elegant-startup-pitch-slide-9.png",
          revision: "42dccc7d32b7bf6713b343717cec6294",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-1.png",
          revision: "1db5a7ebb29c5578a574303be78ef9b4",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-10.png",
          revision: "7f565d888b346b4869c289f4e3695b49",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-2.png",
          revision: "fef3b959123f97c7fe96ec0c4bd66281",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-3.png",
          revision: "3d2bef0150a02cbe07581049436c2b79",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-4.png",
          revision: "c6d12d00aa5a85f8911684bf548496ab",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-5.png",
          revision: "83496c97e66c5ae551edfc6c94ba3d7e",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-6.png",
          revision: "678f8f7bb4f2b13563c92022777930de",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-7.png",
          revision: "de52076ffb4f2cc78a2c8b6294998320",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-8.png",
          revision: "106119110bd646654412575e0f186388",
        },
        {
          url: "/templates/previews/black-grey-3d-tech-slide-9.png",
          revision: "0da05f667661ebec8edc6434ee44659d",
        },
        {
          url: "/templates/previews/black-white-professional.png",
          revision: "083f34285c4c7936f3bc496ff0e3ca34",
        },
        {
          url: "/templates/previews/blue-black-geometric-creative.png",
          revision: "2885b283729fb025a59297560163776b",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-1.png",
          revision: "20a6377c44b93f1a8f01a62c780ec77e",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-10.png",
          revision: "04ae1a9c5121f5eec8d94218f4874272",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-2.png",
          revision: "004ece740d24574bfc3a6f0cfd544d4c",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-3.png",
          revision: "9ef5a5ed628dea67547cad50b4f9e974",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-4.png",
          revision: "bfd3381bbd7295c60c89ee9641f70331",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-5.png",
          revision: "9d9af59dd2c7ce0029bca089173c16c0",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-6.png",
          revision: "6d86ac98eb6e6d33a7019667561c4cd1",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-7.png",
          revision: "0f7edec4c86a68038faa32891abaeda0",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-8.png",
          revision: "a97d10014d75dc494667207d86c55391",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation-slide-9.png",
          revision: "761e395c913c22177c2afda3cbd4f917",
        },
        {
          url: "/templates/previews/blue-green-ai-presentation.png",
          revision: "2cb9668ce490b2780025a6d6d4359981",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-1.png",
          revision: "539e547354492431754bff432104e1d7",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-10.png",
          revision: "efff56a2a1dd0132253129cce5c1ab5b",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-2.png",
          revision: "93011d5a90fcc8111128c30a15820b76",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-3.png",
          revision: "d298d2ca472dc295dfafe60728d0d261",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-4.png",
          revision: "01d859ef60942936990b7b76982fa35b",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-5.png",
          revision: "b412793dcf01a010f246158ec4333f08",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-6.png",
          revision: "246b42ae4165e028d1de5a3aadd2f298",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-7.png",
          revision: "15655bb43f331ab04d06e5169a61c287",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-8.png",
          revision: "4db6227a83fc8cdfb805e300a5549887",
        },
        {
          url: "/templates/previews/blue-white-modern-ai-slide-9.png",
          revision: "c3e14ee1edd59baea8a21ce73eae645f",
        },
        {
          url: "/templates/previews/blue-white-modern-professional.png",
          revision: "1ffea01da8c1df144718d27b1fd59f70",
        },
        {
          url: "/templates/previews/deedy.png",
          revision: "38706e08377330395c870b993e849955",
        },
        {
          url: "/templates/previews/it-manager-cv.png",
          revision: "8c2611f23df165fdb9efb9e704fb3d0f",
        },
        {
          url: "/templates/previews/nit-patna.png",
          revision: "77c767adeb91569aa14454bf9422ff07",
        },
        {
          url: "/templates/previews/software-engineering.png",
          revision: "cc5c7b4b43ec98ae330e5a46028f60ba",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-1.png",
          revision: "6f7f1f5a8ef7e79436a59a9638960fd0",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-10.png",
          revision: "abb5f58eaafd3f1d9c6de453990caa63",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-2.png",
          revision: "0427aacfd597d97aafa38109f8d4dc38",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-3.png",
          revision: "35435e7447db1811fa59fa19f72a26a3",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-4.png",
          revision: "760206da0fb719a31b9eadabd7745d40",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-5.png",
          revision: "3ce40a71a15bcf150ddbc399adee4965",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-6.png",
          revision: "05d7998eeabdd31869252f236bd4d3f6",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-7.png",
          revision: "24f7cf4e4b3acd2751806a4ccb087823",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-8.png",
          revision: "f09d2cde81299bc0f7188f348909dc05",
        },
        {
          url: "/templates/previews/white-blue-sales-strategy-slide-9.png",
          revision: "e2de28d992ce0e1214c100e3cb9b710b",
        },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: i,
            }) =>
              a && "opaqueredirect" === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: "OK",
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https?.*\.(png|jpe?g|webp|svg|gif|tiff|js|css)$/,
      new e.CacheFirst({
        cacheName: "static-resources",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "gstatic-fonts-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/api\/.*$/i,
      new e.NetworkFirst({
        cacheName: "apis-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /.*/i,
      new e.NetworkFirst({
        cacheName: "others-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ));
});
//# sourceMappingURL=sw.js.map
