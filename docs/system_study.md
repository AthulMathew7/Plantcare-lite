# System study — current implementation

This replaces the original proposal-era feasibility study. It describes the
checked-in PlantCareLite application; it is not a deployment or field trial
report.

## Technical feasibility

The repository implements an Expo/React Native application with a bundled
MobileNetV3Large ONNX model executed by ONNX Runtime React Native. SQLite
stores local catalog/profile/history data, and image files are persisted in
app documents where available. A custom native build is required; Expo Go
does not provide the ONNX native module.

The checked-in evaluation summary reports 85.89% overall test-split accuracy
and 54.75% Cassava test-split accuracy across the stated 3,651-image test
split. These are dataset test metrics, not real-world or device guarantees.
Image quality, cropping, domain shift, and class-specific performance remain
material limitations.

## Operational feasibility

The core model/catalog/history loop does not depend on an app backend and is
available locally. Firebase email/password identity is optional and depends
on client configuration and network service. A remote decorative Diagnosis
banner may not be available offline. The scan-sync setting and queue are
present, but a backend uploader/restore service is not implemented.

## Economic and licensing considerations

The repository uses packaged open-source software dependencies, but that
does not establish a license for the whole project or every bundled asset.
Image-by-image source and attribution status is documented in
`disease_image_sources.md`. The four owner-supplied reference photos have no
public license claimed. No project-level license should be inferred where
none is present.

## Current feasibility summary

| Area | Current status |
|---|---|
| On-device inference | Implemented; requires native ONNX build |
| Local persistence | Implemented with SQLite and app document image files |
| Guest mode | Implemented |
| Firebase login/signup | Implemented when configured and online |
| Cloud synchronization | Not implemented |
| Production field accuracy | Not established by repository tests/metrics |
| Physical-device testing | Requires a connected supported device; not demonstrated here |
