# Model, reference photographs, and scan images

## Bundled model

The mobile inference model is `assets/models/plantcare/model.onnx`, loaded as
an Expo asset by `src/services/inferenceService.js`. It is the app's model
input, not a disease photo. Model metadata/artifacts are alongside it;
`machine_learning.md` distinguishes the runtime ONNX file from training and
TFLite artifacts.

## Disease reference photographs

`assets/diseases/` contains the 22 local JPEGs mapped from each entry's
`image` key in `src/constants/diseaseInfo.js`. Expo Metro statically bundles
them via `require`, so class-specific images can render offline. The disease
image helper resolves a source by catalog image key and throws when a
non-empty key has no registered local mapping. The unavailable-class array
currently has no entries.

The repository also contains the four original owner-supplied file names
alongside the optimized filenames. They are not catalog mappings; the
renamed/optimized JPEGs are the mapped assets. Dataset-backed photographs
are documented with dataset/source identifiers, original file names, authors,
licenses, and attribution in [disease_image_sources.md](./disease_image_sources.md).
Owner-supplied assets have no claimed public license.

## User scan images

Camera/gallery URIs are distinct from bundled catalog assets. `persistScanImage`
copies a source into the app documents `scans/` directory where a documents
directory is available; already-persisted URIs are returned unchanged. The
database stores the persisted full-image URI and attempts to save a generated
150 × 150 JPEG thumbnail at compression 0.7.

| Image purpose | Source and path | Used by |
|---|---|---|
| Disease reference | Bundled `assets/diseases/*.jpg`, selected through `diseaseInfo.js` | Diagnosis cards/reference information |
| User scan original | Camera/gallery image copied to app documents; `scan_history.image_path` | Inference input, Result hero, History detail |
| User scan thumbnail | Best-effort generated thumbnail; `scan_history.image_thumbnail_path` | History list thumbnail; original used as fallback |

**A disease reference photo is not a user's scan.** Result's hero displays the
actual captured/selected URI passed to the screen. History list displays the
saved thumbnail or actual original; opening a history record passes its
original image path to Result. Neither screen substitutes the disease
catalog photograph.

## Size and runtime behavior

The disease reference images are mobile-sized local JPEGs. The app does not
fetch these class photos remotely at runtime. The Diagnosis screen's separate
decorative hero image does use a remote Unsplash URI and can be unavailable
without connectivity. Image optimization/provenance claims for class photos
are tracked in the image source document.
