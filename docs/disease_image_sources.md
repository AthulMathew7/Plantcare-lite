# Disease reference image sources

The disease catalog in `src/constants/diseaseInfo.js` is the authoritative
class-to-image mapping and currently maps all 22 supported classes to distinct
local JPEG assets. Photos with documented public sources retain their
source and license details below. Four additional reference photos were
supplied directly by the project owner; no public source, author, or license
was provided or is asserted for those files. Bundled photos are local and
optimized for offline mobile display; no dataset archive is bundled.

## Project-owner-supplied reference photographs

The following original files were provided directly by the project owner.
The local copies were resized when necessary and JPEG-compressed for the app.
No public source, photographer/author, or reuse license was supplied or
verified; this document does not claim CC BY, CC0, public-domain, or any
other license for these photographs.

| Exact disease class | Original supplied filename | Local bundled filename | Catalog entry |
| --- | --- | --- | --- |
| Cassava___Green_Mottle | `Cassava Green Mottle.jpg` | `cassava_green_mottle.jpg` | `Cassava___Green_Mottle` |
| Jackfruit___Algal_Leaf_Spot | `Algal-Leaf-Spot-Scot-Nelson4-1.jpg` | `jackfruit_algal_leaf_spot.jpg` | `Jackfruit___Algal_Leaf_Spot` |
| Jackfruit___Black_Spot | `Black Spot - jackfrruit.jpg` | `jackfruit_black_spot.jpg` | `Jackfruit___Black_Spot` |
| Jackfruit___Healthy | `jackfruit- Healthy Leaf.jpg` | `jackfruit_healthy.jpg` | `Jackfruit___Healthy` |

## Cassava — Cassava Leaf Disease Dataset

- Dataset: [Cassava Leaf Disease Dataset](https://data.mendeley.com/datasets/3832tx2cb2/1)
- DOI: [10.17632/3832tx2cb2.1](https://doi.org/10.17632/3832tx2cb2.1)
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Dataset authors/contributors: L G Divyanth, Peeyush Soni, and Rajendra
  Machavaram.
- The dataset description identifies its folders/classes as healthy cassava,
  Cassava Bacterial Blight (CBB), and Cassava Mosaic Virus (CMV). CMV is the
  source dataset label for the model's Cassava Mosaic Disease class.
- Required attribution: “Cassava Leaf Disease Dataset, by L G Divyanth,
  Peeyush Soni, and Rajendra Machavaram, Mendeley Data,
  DOI 10.17632/3832tx2cb2.1, licensed under CC BY 4.0.” The selected
  photographs were resized and JPEG-compressed for PlantCareLite.

| Disease class | Original dataset file | Original image URL | Local filename | Disease catalog entry |
| --- | --- | --- | --- | --- |
| Cassava___Bacterial_Blight | `CBB (1).JPG` | [Mendeley file](https://data.mendeley.com/public-files/datasets/3832tx2cb2/files/017d834b-c554-4943-9d80-ce2cdc39c34f/file_downloaded) | `cassava_bacterial_blight.jpg` | `Cassava___Bacterial_Blight` |
| Cassava___Healthy | `CHL (1).JPG` | [Mendeley file](https://data.mendeley.com/public-files/datasets/3832tx2cb2/files/4cac0960-3ee2-4d8b-8959-2b5a1a8906a0/file_downloaded) | `cassava_healthy.jpg` | `Cassava___Healthy` |
| Cassava___Mosaic_Disease | `CMD (3).JPG` | [Mendeley file](https://data.mendeley.com/public-files/datasets/3832tx2cb2/files/59d36916-cbbd-47b8-8427-0e74347065cd/file_downloaded) | `cassava_mosaic.jpg` | `Cassava___Mosaic_Disease` |

## Cassava — Brown Streak Disease

- Repository: [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:Distribution_of_cassava_brown_streak_disease_(CBSD)_symptoms_on_cassava.JPG)
- Original image: [Wikimedia Commons upload](https://upload.wikimedia.org/wikipedia/commons/0/04/Distribution_of_cassava_brown_streak_disease_%28CBSD%29_symptoms_on_cassava.JPG)
- Exact image description: “Typical cassava brown streak disease (CBSD)
  symptoms (Chlorosis) tend to appear on the lower part of the plant.”
- Photographer/author: Phillip Abidrabo.
- License: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Required attribution: “Distribution of cassava brown streak disease
  (CBSD) symptoms on cassava, photo by Phillip Abidrabo, via Wikimedia
  Commons, CC BY-SA 3.0.” The bundled JPEG was recompressed; this adapted
  image is available under the same CC BY-SA 3.0 license.

| Disease class | Local filename | Disease catalog entry |
| --- | --- | --- |
| Cassava___Brown_Streak_Disease | `cassava_brown_streak.jpg` | `Cassava___Brown_Streak_Disease` |

## Mango — MLD24

- Dataset: [Mango Leaf Disease Dataset (MLD24)](https://data.mendeley.com/datasets/6dvpywm2m2/1)
- DOI: [10.17632/6dvpywm2m2.1](https://doi.org/10.17632/6dvpywm2m2.1)
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Dataset authors/contributors: Md. Mahir Hasan Shakib, Sumaya Mustofa, and
  Md Taimur Ahad.
- Required attribution: “Mango Leaf Disease Dataset (MLD24), by Md. Mahir
  Hasan Shakib, Sumaya Mustofa, and Md Taimur Ahad, Mendeley Data,
  DOI 10.17632/6dvpywm2m2.1, licensed under CC BY 4.0.” The selected class
  photograph was resized and JPEG-compressed for PlantCareLite.

| Disease class | Local filename | Disease catalog entry |
| --- | --- | --- |
| Mango___Anthracnose | `mango_anthracnose.jpg` | `Mango___Anthracnose` |
| Mango___Bacterial_Canker | `mango_bacterial_canker.jpg` | `Mango___Bacterial_Canker` |
| Mango___Cutting_Weevil | `mango_cutting_weevil.jpg` | `Mango___Cutting_Weevil` |
| Mango___Die_Back | `mango_die_back.jpg` | `Mango___Die_Back` |
| Mango___Gall_Midge | `mango_gall_midge.jpg` | `Mango___Gall_Midge` |
| Mango___Healthy | `mango_healthy.jpg` | `Mango___Healthy` |
| Mango___Powdery_Mildew | `mango_powdery_mildew.jpg` | `Mango___Powdery_Mildew` |
| Mango___Sooty_Mould | `mango_sooty_mould.jpg` | `Mango___Sooty_Mould` |

## Rice — Rice Leaf Disease Image Samples, Version 2

- Dataset: [Rice Leaf Disease Image Samples, Version 2](https://data.mendeley.com/datasets/fwcj7stb8r/2)
- DOI: [10.17632/fwcj7stb8r.2](https://doi.org/10.17632/fwcj7stb8r.2)
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Dataset contributor: Prabira Kumar Sethy. The dataset description cites
  P. K. Sethy, N. K. Barpanda, A. K. Rath, and S. K. Behera (2020).
- Required attribution: “Rice Leaf Disease Image Samples, Version 2, by
  Prabira Kumar Sethy (dataset contributor; citing P. K. Sethy, N. K.
  Barpanda, A. K. Rath, and S. K. Behera, 2020), Mendeley Data,
  DOI 10.17632/fwcj7stb8r.2, licensed under CC BY 4.0.” Selected class
  photographs were resized and JPEG-compressed for PlantCareLite.

| Disease class | Selected dataset file | Local filename | Disease catalog entry |
| --- | --- | --- | --- |
| Rice___Bacterial_Blight | `Bacterialblight/BACTERAILBLIGHT3_003.jpg` | `rice_bacterial_blight.jpg` | `Rice___Bacterial_Blight` |
| Rice___Blast | `Blast/BLAST1_004.jpg` | `rice_blast.jpg` | `Rice___Blast` |
| Rice___Brown_Spot | `Brownspot/BROWNSPOT2_002.jpg` | `rice_brown_spot.jpg` | `Rice___Brown_Spot` |
| Rice___Tungro | `Tungro/TUNGRO1_001.jpg` | `rice_tungro.jpg` | `Rice___Tungro` |

## Coconut — Coconut Tree Disease Dataset

- Dataset: [Coconut Tree Disease Dataset](https://data.mendeley.com/datasets/gh56wbsnj5/1)
- DOI: [10.17632/gh56wbsnj5.1](https://doi.org/10.17632/gh56wbsnj5.1)
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Dataset authors/contributors: Kailas Patil, Sandip Thite, Yogesh
  Suryawanshi, and Prawit Chumchu.
- Required attribution: “Coconut Tree Disease Dataset, by Kailas Patil,
  Sandip Thite, Yogesh Suryawanshi, and Prawit Chumchu, Mendeley Data,
  DOI 10.17632/gh56wbsnj5.1, licensed under CC BY 4.0.” The selected class
  photographs were resized and JPEG-compressed for PlantCareLite.

| Disease class | Selected dataset file | Local filename | Disease catalog entry |
| --- | --- | --- | --- |
| Coconut___Gray_Leaf_Spot | `Gray Leaf Spot/GrayLeafSpot001.jpg` | `coconut_gray_leaf_spot.jpg` | `Coconut___Gray_Leaf_Spot` |
| Coconut___Leaf_Rot | `Leaf Rot/LeafRot141.jpg` | `coconut_leaf_rot.jpg` | `Coconut___Leaf_Rot` |

## Classes without a reference photograph

All 22 catalog classes currently have a local reference image. The four
project-owner-supplied photographs above have no public source or license
asserted here; source/license verification is distinct from their catalog
image availability.

None.

### Sources investigated but not used

- **Open Plant Image Archive (OPIA), `CassavaLeafDis`:** [dataset record](https://ngdc.cncb.ac.cn/opia/dataset/datasets?dataId=35)
  and [record's image table](https://ngdc.cncb.ac.cn/opia/dataset/datasets/tables?dataId=35).
  The visible class metadata includes Cassava Bacterial Blight, Brown Streak,
  Mosaic Disease, and Green Mite; Green Mite is not the model's Green Mottle
  class. The accessible record did not establish an image-specific reuse
  license or permission for redistribution, so no OPIA photo was bundled.
- **Jackfruit class dataset:** [Zenodo record for “Unveiling the Patterns:
  Exploring Deep Learning Techniques for Jackfruit Leaf Disease
  Classification”](https://zenodo.org/records/8106971) describes the exact
  three classes and lists Shuvo Kumar Basak as creator. Its CC BY 4.0
  license is attached to the deposited paper; the [record file listing](https://zenodo.org/api/records/8106971/files)
  contains only `jackfruit_arxiv.pdf`, not the underlying dataset images.
  The paper's license therefore was not treated as a license for the absent
  photo dataset.
- The related [Kaggle Jackfruit Leaf Diseases dataset](https://www.kaggle.com/datasets/shuvokumarbasak4004/jackfruit-leaf-diseases)
  describes the same classes, but its license is “Other (specified in
  description)” and its description does not grant photo redistribution
  rights. Its photos were not used.
