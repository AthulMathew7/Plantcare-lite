/**
 * Disease info seed data for the 22 classes trained in PlantCare Lite.
 * Class names match the trained model's label_map.json (Crop___Disease_Name).
 * Covers 5 crops: Cassava (5), Coconut (2), Jackfruit (3), Mango (8), Rice (4).
 */
const diseaseInfo = [
  // ── Cassava (5 classes) ──
  {
    class_name: 'Cassava___Bacterial_Blight',
    display_name: 'Cassava Bacterial Blight',
    description:
      'Caused by Xanthomonas axonopodis. Leaves show angular water-soaked lesions, wilting, and stem exudates. Can cause complete defoliation.',
    treatment:
      'Use disease-free planting material. Remove and destroy infected plants. Apply copper-based sprays. Practice crop rotation.',
    severity: 'high',
  },
  {
    class_name: 'Cassava___Brown_Streak_Disease',
    display_name: 'Cassava Brown Streak',
    description:
      'A viral disease transmitted by whiteflies. Causes chlorotic streaks on leaves and brown necrotic lesions in root starch.',
    treatment:
      'Use certified clean planting material. Control whitefly populations. Plant resistant varieties. Remove infected plants immediately.',
    severity: 'high',
  },
  {
    class_name: 'Cassava___Green_Mottle',
    display_name: 'Cassava Green Mottle',
    description:
      'A viral disease causing mottled green and yellow patterns on leaves. Leaf distortion and reduced vigor are common symptoms.',
    treatment:
      'Use virus-free planting material. Control beetle vectors. Remove and destroy infected plants. Plant tolerant varieties.',
    severity: 'medium',
  },
  {
    class_name: 'Cassava___Healthy',
    display_name: 'Healthy Cassava',
    description:
      'The cassava plant appears healthy with no visible signs of disease. Vigorous green foliage with normal leaf shape.',
    treatment:
      'Continue regular care. Monitor for pests and disease. Ensure adequate drainage and soil nutrients.',
    severity: 'none',
  },
  {
    class_name: 'Cassava___Mosaic_Disease',
    display_name: 'Cassava Mosaic Disease',
    description:
      'Caused by geminiviruses transmitted by whiteflies. Produces mosaic patterns, leaf curling, and stunting. Economically damaging.',
    treatment:
      'Use resistant/tolerant varieties. Control whitefly vectors. Remove infected plants. Use clean planting material.',
    severity: 'high',
  },

  // ── Coconut (2 classes) ──
  {
    class_name: 'Coconut___Gray_Leaf_Spot',
    display_name: 'Coconut Gray Leaf Spot',
    description:
      'Fungal infection caused by Pestalotiopsis palmarum. Causes small grayish-brown spots with dark borders on old fronds.',
    treatment:
      'Prune and destroy heavily infected lower fronds. Maintain adequate potassium and micronutrient fertilization. Apply copper-based fungicide if severe.',
    severity: 'medium',
  },
  {
    class_name: 'Coconut___Leaf_Rot',
    display_name: 'Coconut Leaf Rot',
    description:
      'Fungal disease affecting young fronds, causing blackened, water-soaked, rotting tissues at leaf tips.',
    treatment:
      'Remove affected leaf tissues. Spray recommended systemic fungicide (such as Mancozeb or Contaf). Ensure proper crown ventilation.',
    severity: 'high',
  },

  // ── Jackfruit (3 classes) ──
  {
    class_name: 'Jackfruit___Algal_Leaf_Spot',
    display_name: 'Jackfruit Algal Leaf Spot',
    description:
      'Caused by Cephaleuros virescens. Forms reddish-brown or rusty orange velvety circular spots on upper leaf surfaces.',
    treatment:
      'Prune dense canopy to increase sunlight and air circulation. Apply copper oxychloride spray during damp seasons.',
    severity: 'medium',
  },
  {
    class_name: 'Jackfruit___Black_Spot',
    display_name: 'Jackfruit Black Spot',
    description:
      'Fungal leaf spot causing dark brown to black circular lesions on mature jackfruit leaves.',
    treatment:
      'Collect and burn fallen infected leaves. Apply protective foliar fungicides. Avoid overhead irrigation.',
    severity: 'medium',
  },
  {
    class_name: 'Jackfruit___Healthy',
    display_name: 'Healthy Jackfruit',
    description:
      'The jackfruit tree leaf shows bright green color, thick leathery texture, and no spots or lesions.',
    treatment:
      'Maintain balanced organic manuring and irrigation. Keep orchard clean and well-drained.',
    severity: 'none',
  },

  // ── Mango (8 classes) ──
  {
    class_name: 'Mango___Anthracnose',
    display_name: 'Mango Anthracnose',
    description:
      'Caused by Colletotrichum gloeosporioides. Dark brown, angular or circular spots on leaves, panicles, and young fruits.',
    treatment:
      'Spray copper fungicide or carbendazim before and after bloom. Prune infected twigs and burn fallen debris.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Bacterial_Canker',
    display_name: 'Mango Bacterial Canker',
    description:
      'Caused by Xanthomonas citri pv. mangiferaeindicae. Water-soaked angular dark lesions surrounded by clear yellow halos.',
    treatment:
      'Spray Streptocycline mixed with copper oxychloride. Remove infected shoots. Use windbreaks to minimize wind damage.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Cutting_Weevil',
    display_name: 'Mango Cutting Weevil',
    description:
      'Pest damage caused by Deporaus marginatus. Weevils cut young tender leaves near the petiole causing severe leaf drop.',
    treatment:
      'Collect and destroy cut leaves on ground. Spray recommended insecticides during flush stage to protect new leaf growth.',
    severity: 'medium',
  },
  {
    class_name: 'Mango___Die_Back',
    display_name: 'Mango Die Back',
    description:
      'Fungal disease (Lasiodiplodia theobromae) causing drying of twigs from top downwards, wilting, and brown discoloration of wood.',
    treatment:
      'Prune affected twigs 2-3 inches below infected wood. Paste cut surfaces with Bordeaux paste or copper fungicide.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Gall_Midge',
    display_name: 'Mango Gall Midge',
    description:
      'Pest damage from Procontarinia species. Causes small pimple-like or wart-like raised galls on upper leaf surfaces.',
    treatment:
      'Prune and destroy heavily infested shoots. Spray systemic insecticide during young leaf flush stage.',
    severity: 'medium',
  },
  {
    class_name: 'Mango___Healthy',
    display_name: 'Healthy Mango',
    description:
      'Mango leaf is dark green, leathery, and free of galls, dark spots, powdery coating, or insect damage.',
    treatment:
      'Continue recommended orchard practices, balanced fertilization, and regular pest monitoring.',
    severity: 'none',
  },
  {
    class_name: 'Mango___Powdery_Mildew',
    display_name: 'Mango Powdery Mildew',
    description:
      'Caused by Oidium mangiferae. White powdery fungal growth covering leaves, flower panicles, and young fruits.',
    treatment:
      'Apply wettable sulfur or systemic fungicides (hexaconazole) at blossom inception and full bloom stages.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Sooty_Mould',
    display_name: 'Mango Sooty Mould',
    description:
      'Black velvety fungal layer growing on honeydew excreted by sap-sucking insects (hoppers, mealybugs, scale insects).',
    treatment:
      'Control sap-sucking insects using neem oil or imidacloprid. Wash black mould with starch solution spray.',
    severity: 'medium',
  },

  // ── Rice (4 classes) ──
  {
    class_name: 'Rice___Bacterial_Blight',
    display_name: 'Bacterial Leaf Blight',
    description:
      'Caused by Xanthomonas oryzae. Leaves show yellowish-white stripes along the veins, turning brown as infection progresses.',
    treatment:
      'Remove and destroy infected plants. Use resistant varieties. Apply copper bactericides. Avoid excessive nitrogen.',
    severity: 'high',
  },
  {
    class_name: 'Rice___Blast',
    display_name: 'Rice Blast',
    description:
      'Caused by the fungus Magnaporthe oryzae. Diamond-shaped lesions with grey centers on leaves, destroying panicles.',
    treatment:
      'Apply tricyclazole or isoprothiolane. Use blast-resistant varieties. Maintain proper water management.',
    severity: 'high',
  },
  {
    class_name: 'Rice___Brown_Spot',
    display_name: 'Brown Spot',
    description:
      'Caused by Bipolaris oryzae. Circular to oval brown spots appear on leaves and grain, reducing yield.',
    treatment:
      'Improve soil fertility and drainage. Use certified seeds. Apply foliar fungicide in severe cases.',
    severity: 'medium',
  },
  {
    class_name: 'Rice___Tungro',
    display_name: 'Rice Tungro',
    description:
      'Viral disease transmitted by green leafhoppers. Causes yellowing and stunting of plants with reduced tillering.',
    treatment:
      'Control leafhopper vectors with insecticides. Plant resistant varieties. Remove infected plants promptly.',
    severity: 'high',
  },
];

export default diseaseInfo;
