# Sources and editorial notes

Checked 18 November 2026. Local project sources support the implementation details below. A class or endpoint establishes that an implementation exists. It cannot establish reliability, adoption, or successful publication.

## Project evidence

| Project | Evidence inspected | Supported description |
| --- | --- | --- |
| STEREO | Local Android project, its build output, project progress notes and both APK audit reports. Source includes SearchScreen, MiniPlayer, FullPlayerSheet, ExoPlayerController, NovaMediaSessionService, PlaylistDao and PlaylistRepositoryImpl. | Android search, mini and expanded player, background media service and playlist storage. Project technologies include Kotlin, Jetpack Compose, Media3 and Room. Existing project notes report a physical playback test. The portfolio player is a silent simulation. |
| Viral Machine | Local Git checkout with origin matching the supplied repository. ProductionQueueManager, VideoPipeline, FFmpegAssemblyEngine, QualityControlEngine and YouTubeShortsPublisher provide implementation evidence. The QC module checks file integrity, media streams, frame content and script structure. | Queue-based short-video assembly with FFmpeg, quality checks and publishing integration. The interactive stages explain a workflow. Successful live uploads, revenue and audience metrics were outside this check. |
| AirUPI | Local Air-UPI-main.zip source snapshot. Inspected server.py, npci_server.py, templates/index.html and the bundled QR and signing library names. The UI calls nacl.sign.detached.verify and keeps a local nonce set. The clearinghouse defines database initialization and batch sync. | Educational QR voucher prototype with local signature verification and later online reconciliation. A disconnected merchant cannot see another merchant's ledger, so cross-merchant double spending remains possible. The portfolio exchanges no money. |

### Images and links

The STEREO debug APK exists and its SHA-256 is `78353ee5106b7149045af4bbbf1af41ea83a17aea0f1799e4561b7dcb0544f95`. The separate supplied APK audit describes an earlier hash. The test-output folder contains captures from search, playback and theme testing, but the checked PNGs have been transcoded as UTF-16 text, including replacement characters. They do not decode. The site therefore uses an explicitly illustrative player. A public STEREO repository could not be established.

Public links supplied by the project owner are [GitHub profile](https://github.com/rishibandaru3109), [Viral Machine](https://github.com/rishibandaru3109/Viral-Machine) and [AirUPI](https://github.com/rishibandaru3109/Air-UPI). Live GitHub pages and API requests were unavailable during research. The local Viral Machine remote confirms its URL. The AirUPI snapshot corroborates its code, but does not contain a Git remote.

## Design references

| Source | Observation | Application to this portfolio |
| --- | --- | --- |
| [Hackathoni](https://www.hackathoni.in/) | Chapter navigation follows stages of a boat journey. Calls to touch the water and change viewpoints give the visitor a reason to interact. The page labels its miniature as illustrative. | Use short, optional experiments and name simulated interfaces explicitly. |
| [Obsidian UI](https://www.obsidianui.dev/components) | The catalog opens with an example dashboard and an indexed component list. The component names distinguish interactions such as Hover Image and Draggable Marquee. | Keep controls beside their previews and give each experiment a clear purpose. |
| [Aceternity UI](https://ui.aceternity.com/components) | Separate component, block and interaction catalogs present effects as modular pieces. | Confine image treatment to project artwork so descriptions stay legible. |
| [Wensity UI](https://ui.wensity.com/components) | The catalog separates text animation, cinematic interaction and 3D components. The [Canvas Text page](https://ui.wensity.com/components/canvas-text) documents a canvas particle effect. | Give the name reveal its own short moment and retain semantic text. |
| [Yogi Suria](https://ysuriadesign.co/) | Direct page fetch was unavailable. A [secondary portfolio review](https://wiqqi.app/dive-club-portfolios) describes moving through a 3D scene by scrolling. | Give the hero spatial depth and keep project links directly accessible. |
| [Portfolio V2](https://portfolio-v2-iota-rouge.vercel.app/) | Direct and alternate-protocol requests were unavailable. No attributable observation. | No design claim or copied asset from this reference. |

The four accessible pages were inspected through their retrieved content. Live hover timing, mobile rendering, cursor response and loading sequences on the reference sites were not independently measured.
