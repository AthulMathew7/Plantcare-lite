# Disease catalog

`src/constants/diseaseInfo.js` is the authoritative 22-entry catalog and
contains the static class-to-local-image map. `database.js` upserts those
entries into SQLite table `disease_info` during initialization. The order
below matches the ONNX output index order; do not reorder it.

The descriptions below summarize the current catalog copy for documentation.
The source module remains authoritative for the full exact text displayed in
the app. Severity values are catalog labels (`none`, `medium`, `high`), not
computed by the model. Treatment is educational management text, not a
chemical prescription.

| # | Internal class | Display name | Crop | Local reference image |
|---:|---|---|---|---|
| 0 | `Cassava___Bacterial_Blight` | Cassava Bacterial Blight | Cassava | `cassava_bacterial_blight.jpg` |
| 1 | `Cassava___Brown_Streak_Disease` | Cassava Brown Streak | Cassava | `cassava_brown_streak.jpg` |
| 2 | `Cassava___Green_Mottle` | Cassava Green Mottle | Cassava | `cassava_green_mottle.jpg` |
| 3 | `Cassava___Healthy` | Healthy Cassava | Cassava | `cassava_healthy.jpg` |
| 4 | `Cassava___Mosaic_Disease` | Cassava Mosaic Disease | Cassava | `cassava_mosaic.jpg` |
| 5 | `Coconut___Gray_Leaf_Spot` | Coconut Gray Leaf Spot | Coconut | `coconut_gray_leaf_spot.jpg` |
| 6 | `Coconut___Leaf_Rot` | Coconut Leaf Rot | Coconut | `coconut_leaf_rot.jpg` |
| 7 | `Jackfruit___Algal_Leaf_Spot` | Jackfruit Algal Leaf Spot | Jackfruit | `jackfruit_algal_leaf_spot.jpg` |
| 8 | `Jackfruit___Black_Spot` | Jackfruit Black Spot | Jackfruit | `jackfruit_black_spot.jpg` |
| 9 | `Jackfruit___Healthy` | Healthy Jackfruit | Jackfruit | `jackfruit_healthy.jpg` |
| 10 | `Mango___Anthracnose` | Mango Anthracnose | Mango | `mango_anthracnose.jpg` |
| 11 | `Mango___Bacterial_Canker` | Mango Bacterial Canker | Mango | `mango_bacterial_canker.jpg` |
| 12 | `Mango___Cutting_Weevil` | Mango Cutting Weevil | Mango | `mango_cutting_weevil.jpg` |
| 13 | `Mango___Die_Back` | Mango Die Back | Mango | `mango_die_back.jpg` |
| 14 | `Mango___Gall_Midge` | Mango Gall Midge | Mango | `mango_gall_midge.jpg` |
| 15 | `Mango___Healthy` | Healthy Mango | Mango | `mango_healthy.jpg` |
| 16 | `Mango___Powdery_Mildew` | Mango Powdery Mildew | Mango | `mango_powdery_mildew.jpg` |
| 17 | `Mango___Sooty_Mould` | Mango Sooty Mould | Mango | `mango_sooty_mould.jpg` |
| 18 | `Rice___Bacterial_Blight` | Bacterial Leaf Blight | Rice | `rice_bacterial_blight.jpg` |
| 19 | `Rice___Blast` | Rice Blast | Rice | `rice_blast.jpg` |
| 20 | `Rice___Brown_Spot` | Brown Spot | Rice | `rice_brown_spot.jpg` |
| 21 | `Rice___Tungro` | Rice Tungro | Rice | `rice_tungro.jpg` |

## Class information

Each numbered class below corresponds to the row with the same number above.
Treatment and prevention are summaries of the catalog text; disease-free
planting material, sanitation, monitoring, pruning, and crop-care guidance
appear where relevant. Where chemical products are mentioned in the catalog,
it cautions that they be registered locally and used only as directed by local
extension guidance and product label.

### Cassava

**0 — Cassava Bacterial Blight (`Cassava___Bacterial_Blight`)**

- **Overview/symptoms:** Bacterial disease with angular water-soaked lesions
  and yellow halos; plants may wilt and lose leaves.
- **Cause:** *Xanthomonas axonopodis*; warm wet conditions and poor sanitation
  favor spread.
- **Treatment/management:** disease-free planting material, remove heavily
  infected plants, prune infected stems, field hygiene, and rotation; product
  use only if recommended locally and label-compliant.
- **Prevention:** healthy/resistant material, avoid moving diseased cuttings,
  monitor and remove early infections.
- **Cure status:** No direct cure; manage infected material, spread, and field
  hygiene. **Severity:** high.

**1 — Cassava Brown Streak (`Cassava___Brown_Streak_Disease`)**

- **Overview/symptoms:** viral disease with pale leaf streaks/mottling;
  tubers may have brown necrotic lesions and reduced quality.
- **Cause:** cassava brown streak viruses, spread by infected planting
  material and insect vectors.
- **Treatment/management:** clean certified material, remove infected plants,
  reduce whitefly pressure, and use resistant varieties if available.
- **Prevention:** select healthy stems, avoid reusing infected cuttings, and
  scout regularly.
- **Cure status:** No direct cure; focus on clean planting material,
  resistant varieties, and whitefly spread reduction. **Severity:** high.

**2 — Cassava Green Mottle (`Cassava___Green_Mottle`)**

- **Overview/symptoms:** irregular light/dark green or yellow mottling,
  distortion, reduced vigor, and slower growth.
- **Cause:** viral infection associated with vectors and infected cuttings.
- **Treatment/management:** virus-free cuttings, remove obvious infected
  plants, reduce vector pressure, and rotate with non-host crops where
  practical.
- **Prevention:** inspect planting material, maintain field hygiene, and
  remove diseased plants early.
- **Cure status:** No direct cure; manage clean cuttings, early removal, and
  vector spread. **Severity:** medium.

**3 — Healthy Cassava (`Cassava___Healthy`)**

- **Overview/symptoms:** vigorous green, well-formed leaves without
  characteristic lesions, streaks, or distortion.
- **Cause:** healthy crop state, not a disease.
- **Treatment/management:** routine soil moisture/nutrition care, weed
  control, and inspection for pests or symptoms.
- **Prevention:** clean planting material, drainage, balanced nutrition, and
  canopy monitoring.
- **Cure status:** Not a disease; no cure is needed. **Severity:** none.

**4 — Cassava Mosaic Disease (`Cassava___Mosaic_Disease`)**

- **Overview/symptoms:** patchy light-green/yellow mosaic, curling or twisting
  leaves, stunting, and weak growth.
- **Cause:** geminiviruses, spread mainly by whiteflies and infected planting
  material.
- **Treatment/management:** resistant varieties where available, remove
  infected plants, reduce whiteflies, and use clean certified cuttings.
- **Prevention:** sanitize planting material, avoid infected cuttings, and
  survey/remove cases early.
- **Cure status:** No direct cure; use resistant material, removal, and
  whitefly control. **Severity:** high.

### Coconut

**5 — Coconut Gray Leaf Spot (`Coconut___Gray_Leaf_Spot`)**

- **Overview/symptoms:** gray-brown lesions with dark margins, often on older
  fronds; heavy infection can weaken foliage.
- **Cause:** fungal pathogens favored by humidity and stressed/crowded palms.
- **Treatment/management:** prune/remove heavily infected fronds, improve
  airflow, and maintain nutrition; any product only under local extension and
  label guidance.
- **Prevention:** remove debris, avoid congested canopy, maintain sanitation
  and drainage.
- **Cure status:** No direct cure for damaged fronds; sanitation, airflow, and
  protection of healthy growth. **Severity:** medium.

**6 — Coconut Leaf Rot (`Coconut___Leaf_Rot`)**

- **Overview/symptoms:** young frond tips/margins become dark and water-soaked,
  then dry/collapse.
- **Cause:** fungal infection favored by humid conditions, poor crown
  ventilation, and damaged tissue.
- **Treatment/management:** remove the worst affected leaves and improve
  airflow; product only when recommended locally and label-compliant.
- **Prevention:** avoid wet debris/overwatering of the crown and maintain
  pruning and airflow.
- **Cure status:** No direct cure for severely rotted tissue; remove affected
  material and protect new fronds. **Severity:** high.

### Jackfruit

**7 — Jackfruit Algal Leaf Spot (`Jackfruit___Algal_Leaf_Spot`)**

- **Overview/symptoms:** circular rusty/velvety spots on leaves; severe
  infection affects photosynthesis.
- **Cause:** *Cephaleuros virescens*, favored by humid, shaded conditions.
- **Treatment/management:** prune dense canopy, improve sun/airflow, remove
  heavily affected leaves; any product only under local extension and label
  guidance.
- **Prevention:** avoid dense shade and prolonged leaf wetness; prune
  promptly.
- **Cure status:** No direct cure for marked lesions; reduce shade/leaf
  wetness and protect new growth. **Severity:** medium.

**8 — Jackfruit Black Spot (`Jackfruit___Black_Spot`)**

- **Overview/symptoms:** dark brown/black circular or oval lesions, sometimes
  concentric; repeated attack weakens canopy.
- **Cause:** fungal pathogens favored by wet foliage and poor sanitation.
- **Treatment/management:** remove infected/fallen leaves, prune affected
  branches as needed; any product only under local extension and label
  guidance.
- **Prevention:** avoid overhead irrigation, keep orchard floor clean, and
  maintain airflow.
- **Cure status:** No direct cure for existing lesions; sanitation and
  airflow limit further infection. **Severity:** medium.

**9 — Healthy Jackfruit (`Jackfruit___Healthy`)**

- **Overview/symptoms:** glossy, leathery, evenly green leaves without spots,
  holes, or obvious stress.
- **Cause:** healthy tree condition.
- **Treatment/management:** routine feeding, irrigation, sanitation, and
  canopy monitoring.
- **Prevention:** maintain spacing, inspect leaves, and remove debris.
- **Cure status:** Not a disease; no cure is needed. **Severity:** none.

### Mango

**10 — Mango Anthracnose (`Mango___Anthracnose`)**

- **Overview/symptoms:** dark sunken lesions on leaves, flowers/panicles, and
  young fruit, especially during wet periods.
- **Cause:** *Colletotrichum gloeosporioides*, favored by warm wet weather and
  dense canopies.
- **Treatment/management:** prune infected twigs, remove fallen debris, and
  improve airflow; fungicide only if recommended locally and used according
  to label.
- **Prevention:** orchard sanitation, airflow, avoid unnecessary overhead
  watering; protective products only per local recommendation and label.
- **Cure status:** No direct cure for infected tissue; sanitation, pruning,
  and protecting susceptible growth. **Severity:** high.

**11 — Mango Bacterial Canker (`Mango___Bacterial_Canker`)**

- **Overview/symptoms:** dark often-angular leaf lesions with yellow margins;
  shoots can lose vigor.
- **Cause:** *Xanthomonas citri* pathovars; rain, wind injury, and poor hygiene
  can worsen spread.
- **Treatment/management:** remove infected shoots, limit canopy injury, and
  use any product only on local extension advice and per label.
- **Prevention:** clean propagation material, careful pruning, and remove
  infected branches.
- **Cure status:** No direct cure for infected tissue; sanitation, careful
  pruning, and limiting spread. **Severity:** high.

**12 — Mango Cutting Weevil (`Mango___Cutting_Weevil`)**

- **Overview/symptoms:** tender leaves clipped near petioles, leaf drop, and
  weak new flush.
- **Cause:** mango cutting weevils attacking tender growth.
- **Treatment/management:** collect/destroy damaged fallen leaves; control
  products only if locally recommended and label-compliant.
- **Prevention:** monitor new flushes and reduce pest shelter around the
  orchard.
- **Cure status:** No cure for damage already done; protect new flushes and
  manage weevil populations. **Severity:** medium.

**13 — Mango Die Back (`Mango___Die_Back`)**

- **Overview/symptoms:** shoot tips/twigs dry from the tip downward; affected
  wood browns and becomes brittle.
- **Cause:** often associated with fungal infection and stress, including
  exposed pruning wounds.
- **Treatment/management:** prune to healthy tissue, sanitize cuts, and use
  fungicide only if locally advised and label-compliant.
- **Prevention:** avoid injury, maintain balanced canopy, and prune
  hygienically.
- **Cure status:** No direct cure for dead branch tissue; prune to healthy
  wood and protect remaining branches. **Severity:** high.

**14 — Mango Gall Midge (`Mango___Gall_Midge`)**

- **Overview/symptoms:** wart-like raised galls on leaves and distortion of
  tender growth.
- **Cause:** gall midge insects attacking young leaves/shoots.
- **Treatment/management:** remove heavily infested shoots; any chemical
  control only if locally recommended and label-compliant during flush.
- **Prevention:** inspect new flush early and monitor pest pressure.
- **Cure status:** No cure for existing galls; monitor new flushes and limit
  midge damage. **Severity:** medium.

**15 — Healthy Mango (`Mango___Healthy`)**

- **Overview/symptoms:** glossy, firm, evenly colored leaves without galls,
  powdery coating, or abnormal lesions.
- **Cause:** normal healthy mango growth.
- **Treatment/management:** normal orchard care, balanced fertilization,
  water management, and inspection.
- **Prevention:** scout regularly and maintain an open canopy.
- **Cure status:** Not a disease; no cure is needed. **Severity:** none.

**16 — Mango Powdery Mildew (`Mango___Powdery_Mildew`)**

- **Overview/symptoms:** white powder-like fungal growth on leaves, flower
  panicles, and young fruit.
- **Cause:** powdery mildew fungi on susceptible growth under favorable
  humidity.
- **Treatment/management:** maintain airflow/moisture management; fungicide
  only when recommended locally and used per label.
- **Prevention:** monitor flowering and fruit set, maintain tree spacing, and
  use preventive products only according to extension advice and label.
- **Cure status:** No direct cure for damaged tissue; protect new growth and
  limit spread. **Severity:** high.

**17 — Mango Sooty Mould (`Mango___Sooty_Mould`)**

- **Overview/symptoms:** dark soot-like film on leaf/fruit surfaces can
  reduce photosynthesis.
- **Cause:** mould grows on honeydew from sap-feeding insects such as
  hoppers, mealybugs, or scales.
- **Treatment/management:** address honeydew-producing insects and wash
  surface if needed; catalog calls for suitable local treatment.
- **Prevention:** inspect for sap-feeding insects and maintain orchard
  hygiene.
- **Cure status:** No direct cure is needed for the surface growth once its
  cause is addressed; manage honeydew-producing insects. **Severity:** medium.

### Rice

**18 — Bacterial Leaf Blight (`Rice___Bacterial_Blight`)**

- **Overview/symptoms:** yellow/white streaks along veins turn brown and
  necrotic; severe cases affect grain filling.
- **Cause:** *Xanthomonas oryzae*, favored by warm humid conditions and
  infected debris.
- **Treatment/management:** resistant varieties, remove infected plants or
  patches, avoid excessive nitrogen; products only if locally recommended
  and label-compliant.
- **Prevention:** clean seed, residue/field hygiene, balanced nutrients, and
  regular monitoring.
- **Cure status:** No direct cure for infected plants; resistant varieties,
  hygiene, and limiting spread. **Severity:** high.

**19 — Rice Blast (`Rice___Blast`)**

- **Overview/symptoms:** spindle/diamond-shaped lesions with pale/gray
  centers and dark borders; panicles may also be damaged.
- **Cause:** *Magnaporthe oryzae*, favored by humidity, cool nights, and
  susceptible varieties.
- **Treatment/management:** resistant varieties and careful water management;
  fungicide only if locally recommended and label-compliant.
- **Prevention:** healthy seed, avoid dense canopies, field sanitation, and
  monitoring during vulnerable periods.
- **Cure status:** No direct cure for infected tissue; protect healthy plants
  and manage crop conditions. **Severity:** high.

**20 — Brown Spot (`Rice___Brown_Spot`)**

- **Overview/symptoms:** circular/oval brown leaf lesions; severe cases may
  affect grain and yield.
- **Cause:** *Bipolaris oryzae*, associated in the catalog with weak vigor,
  poor fertility, and moisture stress.
- **Treatment/management:** improve fertility/drainage, use certified seed;
  fungicide only for severe infection if locally advised and used per label.
- **Prevention:** avoid prolonged water stress, monitor fields, and manage
  residues.
- **Cure status:** No direct cure for existing lesions; improve crop vigor,
  seed health, and reduce further infection. **Severity:** medium.

**21 — Rice Tungro (`Rice___Tungro`)**

- **Overview/symptoms:** yellow/orange-yellow leaves, stunting, reduced
  tillering, and poor grain development.
- **Cause:** viral disease transmitted by green leafhoppers.
- **Treatment/management:** manage leafhopper vectors, remove infected plants,
  use resistant varieties, and scout regularly.
- **Prevention:** healthy seed, early vector management, timing, and field
  hygiene.
- **Cure status:** No direct cure; resistant varieties, early removal, and
  leafhopper management. **Severity:** high.

## Image source and health-condition caveats

The class-to-file mapping above is the local asset map and covers all 22
classes. Image licensing/source details and required attributions are in
[disease_image_sources.md](./disease_image_sources.md). Four source images
were supplied by the project owner; no public author/license is asserted for
them. A healthy class is a model label, not a guarantee that the whole plant
is disease-free.
