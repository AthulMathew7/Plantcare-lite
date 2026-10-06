/**
 * Disease catalog for the 22 model classes used in PlantCare Lite.
 * The single source of truth for disease metadata and local image references.
 */
const diseaseInfo = [
  {
    class_name: 'Cassava___Bacterial_Blight',
    display_name: 'Cassava Bacterial Blight',
    crop: 'Cassava',
    image: 'cassava_bacterial_blight',
    cure_status: 'No direct cure is available. Management focuses on removing infected material, limiting spread, and maintaining field hygiene.',
    description:
      'A bacterial disease that causes angular water-soaked lesions, wilting, and can lead to severe defoliation when infection spreads.',
    short_description:
      'Water-soaked angular lesions and wilting are common on leaves and stems.',
    symptoms:
      'Leaves develop angular, water-soaked lesions with yellow halos. Affected plants often wilt rapidly and may lose foliage as the disease advances.',
    cause:
      'It is caused by Xanthomonas axonopodis and spreads quickly under warm, wet conditions and poor sanitation.',
    treatment:
      'Use disease-free planting material and remove heavily infected plants. Prune infected stems and, if recommended locally, use an appropriately registered product according to the local agricultural extension recommendation and label. Rotate crops to reduce pressure between seasons.',
    prevention:
      'Keep fields clean, avoid moving diseased cuttings, and plant resistant or healthy planting material. Monitor plants regularly and remove early symptoms before they spread.',
    severity: 'high',
  },
  {
    class_name: 'Cassava___Brown_Streak_Disease',
    display_name: 'Cassava Brown Streak',
    crop: 'Cassava',
    image: 'cassava_brown_streak',
    cure_status: 'No direct cure is available. Management focuses on clean planting material, resistant varieties, and reducing whitefly spread.',
    description:
      'This viral disease produces yellow streaks on leaves and reduces root quality and market value.',
    short_description:
      'Yellow chlorotic streaks and root discoloration are the main field symptoms.',
    symptoms:
      'Leaves show pale chlorotic streaks and irregular mottling. Tubers may develop brown necrotic lesions and starch quality can decline.',
    cause:
      'Caused by cassava brown streak viruses and spread mainly through infected planting material and insect vectors.',
    treatment:
      'Use clean, certified planting material and remove infected plants promptly. Manage whitefly populations and plant resistant varieties when available. Keep field sanitation strong to reduce virus carryover.',
    prevention:
      'Select healthy stems for planting and avoid reusing infected material. Regular scouting helps catch outbreaks early and limits spread within fields.',
    severity: 'high',
  },
  {
    class_name: 'Cassava___Green_Mottle',
    display_name: 'Cassava Green Mottle',
    crop: 'Cassava',
    image: 'cassava_green_mottle',
    cure_status: 'No direct cure is available. Management focuses on clean cuttings, early removal of affected plants, and limiting insect-vector spread.',
    description:
      'A viral disease marked by mottled light and dark green patches on cassava leaves.',
    short_description:
      'Leaves show variegated green patterns and mild distortion.',
    symptoms:
      'Leaves develop irregular green and yellow mottling with some distortion and reduced vigor. Plants may remain productive but often show slower growth.',
    cause:
      'It is caused by viral infection, often linked to insect vectors and infected planting material.',
    treatment:
      'Use virus-free cuttings and remove obvious infected plants from the field. Reduce vector pressure and rotate with non-host crops where possible.',
    prevention:
      'Inspect planting material carefully before use and maintain proper field hygiene. Early removal of diseased plants limits secondary spread.',
    severity: 'medium',
  },
  {
    class_name: 'Cassava___Healthy',
    display_name: 'Healthy Cassava',
    crop: 'Cassava',
    image: 'cassava_healthy',
    cure_status: 'Not a disease; no cure is needed. Continue routine crop care and monitoring.',
    description:
      'The cassava plant appears healthy with vigorous green foliage and no obvious disease symptoms.',
    short_description:
      'Strong green foliage and uniform leaf development indicate a healthy crop.',
    symptoms:
      'Leaves are generally green, well formed, and evenly distributed without characteristic lesions, streaks, or distortions.',
    cause:
      'This is a healthy crop state, not a disease condition. It reflects good field management and stable growth conditions.',
    treatment:
      'Maintain soil moisture and nutrition, keep weeds low, and monitor for pests or early disease signs. Routine field inspection promotes continued vigour.',
    prevention:
      'Use clean planting material and regularly inspect the canopy for early symptoms. Good drainage and balanced nutrition support long-term crop health.',
    severity: 'none',
  },
  {
    class_name: 'Cassava___Mosaic_Disease',
    display_name: 'Cassava Mosaic Disease',
    crop: 'Cassava',
    image: 'cassava_mosaic',
    cure_status: 'No direct cure is available. Management focuses on resistant planting material, removal of infected plants, and whitefly control.',
    description:
      'A widespread viral disease that causes mosaic patterns, leaf curling, and reduced plant growth.',
    short_description:
      'Mosaic leaf patterns and stunted growth are the classic signs.',
    symptoms:
      'Leaves develop a patchy mosaic of light green and yellow areas and can curl or twist as infection progresses. Affected plants often remain stunted and weak.',
    cause:
      'Caused by geminiviruses spread largely by whiteflies and through infected planting material.',
    treatment:
      'Plant resistant varieties where available, remove infected stems, and control whitefly populations. Use clean, certified planting material to limit reinfection.',
    prevention:
      'Sanitize all planting material and avoid bringing infected cuttings onto the farm. Early surveillance and prompt removal of diseased plants reduce spread.',
    severity: 'high',
  },
  {
    class_name: 'Coconut___Gray_Leaf_Spot',
    display_name: 'Coconut Gray Leaf Spot',
    crop: 'Coconut',
    image: 'coconut_gray_leaf_spot',
    cure_status: 'No direct cure is available for damaged fronds. Management focuses on sanitation, canopy airflow, and protecting healthy growth.',
    description:
      'A fungal leaf spot commonly seen on older coconut fronds as gray-brown lesions with dark margins.',
    short_description:
      'Older fronds develop grayish-brown lesions with dark borders.',
    symptoms:
      'Spotting begins as small gray-brown lesions that enlarge and form dark margins. Heavy infection reduces photosynthesis and can weaken older fronds.',
    cause:
      'Usually caused by fungal pathogens that thrive in humid conditions and on stressed or overcrowded palms.',
    treatment:
      'Prune and remove heavily infected fronds and improve orchard airflow. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label. Maintain balanced soil nutrition for stronger foliage.',
    prevention:
      'Remove infected debris and avoid unnecessary canopy congestion. Good sanitation and drainage reduce recurrent fungal pressure.',
    severity: 'medium',
  },
  {
    class_name: 'Coconut___Leaf_Rot',
    display_name: 'Coconut Leaf Rot',
    crop: 'Coconut',
    image: 'coconut_leaf_rot',
    cure_status: 'No direct cure is available for severely rotted tissue. Management focuses on removing affected material and protecting new fronds.',
    description:
      'Leaf rot affects young fronds and causes blackened, water-soaked tissue that can spread quickly under damp conditions.',
    short_description:
      'Young fronds turn dark and rotting near their tips or edges.',
    symptoms:
      'Leaf tips and margins become blackened and water-soaked, then dry out and collapse. Severely affected fronds lose vigor and become less productive.',
    cause:
      'Fungal infection is favored by high humidity, poor ventilation around the crown, and damaged tissue.',
    treatment:
      'Remove the worst affected leaves and improve air movement around the crown. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label as part of a field sanitation plan.',
    prevention:
      'Avoid overwatering the crown and keep the palm base and surrounding area free from wet debris. Regular pruning and airflow management help prevent outbreaks.',
    severity: 'high',
  },
  {
    class_name: 'Jackfruit___Algal_Leaf_Spot',
    display_name: 'Jackfruit Algal Leaf Spot',
    crop: 'Jackfruit',
    image: 'jackfruit_algal_leaf_spot',
    cure_status: 'No direct cure is available for marked lesions. Management focuses on reducing shade and leaf wetness and protecting new growth.',
    description:
      'A foliar disease caused by algae that creates rusty, velvety spots on the upper leaf surface.',
    short_description:
      'Rusty orange, velvety spots appear on mature leaves.',
    symptoms:
      'Circular rust-colored spots form on the leaf surface and often resemble velvety patches. Severely infected leaves become less efficient at photosynthesis.',
    cause:
      'This is caused by Cephaleuros virescens, an algal pathogen favored by humid, shaded conditions.',
    treatment:
      'Improve sunlight penetration by pruning dense canopy and remove badly infected leaves. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label.',
    prevention:
      'Keep the orchard open and well ventilated and avoid dense shading that keeps leaves wet. Timely pruning reduces disease severity.',
    severity: 'medium',
  },
  {
    class_name: 'Jackfruit___Black_Spot',
    display_name: 'Jackfruit Black Spot',
    crop: 'Jackfruit',
    image: 'jackfruit_black_spot',
    cure_status: 'No direct cure is available for existing lesions. Management focuses on sanitation, airflow, and limiting further infection.',
    description:
      'A fungal leaf spot that forms dark lesions on jackfruit leaves and can reduce leaf health over time.',
    short_description:
      'Dark circular lesions spread across mature leaves and weaken the canopy.',
    symptoms:
      'Leaves develop dark brown to black circular or oval lesions with a concentric pattern. Repeated attacks reduce leaf area and can lower overall tree vigor.',
    cause:
      'Fungal pathogens become active when foliage stays wet and orchard sanitation is poor.',
    treatment:
      'Remove fallen and infected leaves from the ground and prune affected branches if needed. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label.',
    prevention:
      'Avoid overhead irrigation and keep orchard floors clean. Healthy canopy management and prompt sanitation reduce infection spread.',
    severity: 'medium',
  },
  {
    class_name: 'Jackfruit___Healthy',
    display_name: 'Healthy Jackfruit',
    crop: 'Jackfruit',
    image: 'jackfruit_healthy',
    cure_status: 'Not a disease; no cure is needed. Continue routine orchard care and monitoring.',
    description:
      'Healthy jackfruit leaves are deep green, glossy, and free of lesions or deformities.',
    short_description:
      'Strong leaf color and healthy canopy indicate a vigorous tree.',
    symptoms:
      'Leaves are dense, leathery, and evenly green without spots, holes, or signs of nutrient stress.',
    cause:
      'This reflects a well-managed fruit tree with balanced nutrition, drainage, and low pest pressure.',
    treatment:
      'Maintain regular organic feeding, keep orchard floors clean, and monitor the canopy for early symptoms. Good irrigation and sanitation support long-term health.',
    prevention:
      'Watch for leaf stress, maintain proper spacing, and remove debris that may harbor fungal disease or pests.',
    severity: 'none',
  },
  {
    class_name: 'Mango___Anthracnose',
    display_name: 'Mango Anthracnose',
    crop: 'Mango',
    image: 'mango_anthracnose',
    cure_status: 'No direct cure is available for infected tissue. Management focuses on sanitation, pruning, and protecting susceptible growth.',
    description:
      'A major mango fungal disease that attacks leaves, flowers, and young fruit as dark, sunken lesions.',
    short_description:
      'Leaf and fruit tissues develop dark, sunken lesions after humid weather.',
    symptoms:
      'Dark brown or black lesions appear on leaves, flower panicles, and young fruit. Infected tissues can spread rapidly during wet periods.',
    cause:
      'Caused by Colletotrichum gloeosporioides and favored by warm, wet seasons and dense canopies.',
    treatment:
      'Prune infected twigs and remove fallen debris. If fungicide use is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label during vulnerable growth stages. Reduce canopy density to improve air circulation.',
    prevention:
      'Use good orchard sanitation, maintain airflow, and avoid unnecessary overhead watering. Any protective spray should be an appropriately registered product used according to local agricultural extension recommendations and its label.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Bacterial_Canker',
    display_name: 'Mango Bacterial Canker',
    crop: 'Mango',
    image: 'mango_bacterial_canker',
    cure_status: 'No direct cure is available for infected tissue. Management focuses on sanitation, careful pruning, and limiting spread.',
    description:
      'A bacterial disease that creates dark, angular lesions on leaves and shoots with yellow halos.',
    short_description:
      'Angular dark lesions with yellow margins are typical on foliage.',
    symptoms:
      'Leaf lesions are dark, often angular, and surrounded by yellowing tissue. Affected shoots may lose vigor and can become weak points for future infection.',
    cause:
      'Caused by Xanthomonas citri pathovars and worsened by rain, wind damage, and poor orchard hygiene.',
    treatment:
      'Remove infected shoots and, if advised locally, use an appropriately registered product according to the local agricultural extension recommendation and label. Protect the canopy from wind damage and avoid leaving pruning wounds exposed.',
    prevention:
      'Use clean propagation material and reduce mechanical injury. Sanitary pruning and immediate removal of infected branches help limit spread.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Cutting_Weevil',
    display_name: 'Mango Cutting Weevil',
    crop: 'Mango',
    image: 'mango_cutting_weevil',
    cure_status: 'No cure is needed for the pest damage already done. Management focuses on protecting new flushes and reducing weevil populations.',
    description:
      'This pest damages tender growth by cutting leaf petioles and causing severe leaf loss in flushes.',
    short_description:
      'Tender leaves are cut and damaged near the stem, leading to leaf drop.',
    symptoms:
      'Young leaves are clipped or severed near the petiole, often leaving damaged shoots and obvious leaf drop. New flushes can become weak and stunted.',
    cause:
      'The damage is caused by mango cutting weevils, which attack tender growth during active flush periods.',
    treatment:
      'Collect and destroy damaged leaves from the ground. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label during the flush stage.',
    prevention:
      'Monitor new flushes closely and reduce shelter for pest populations around the orchard. Timely intervention before outbreaks build up is important.',
    severity: 'medium',
  },
  {
    class_name: 'Mango___Die_Back',
    display_name: 'Mango Die Back',
    crop: 'Mango',
    image: 'mango_die_back',
    cure_status: 'No direct cure is available for dead branch tissue. Management focuses on pruning to healthy wood and protecting remaining branches.',
    description:
      'Die-back causes twigs to dry from the tip downward and can lead to severe branch decline.',
    short_description:
      'Shoot tips die back and branch tissue turns brown and brittle.',
    symptoms:
      'Young shoots and twigs dry out from the top downward, and wood beneath the damaged area turns brown. Affected branches may show wilting and poor regrowth.',
    cause:
      'Commonly associated with fungal infection and stress, especially where pruning wounds or branch injuries remain exposed.',
    treatment:
      'Prune back to healthy tissue and sanitize the cut surfaces. If a local agricultural extension service recommends fungicide use, use an appropriately registered product according to its recommendation and label. Protect wounded wood and reduce disease spread through clean pruning.',
    prevention:
      'Avoid unnecessary injury to branches and keep the tree canopy balanced. Sanitary pruning and healthy orchard management reduce die-back pressure.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Gall_Midge',
    display_name: 'Mango Gall Midge',
    crop: 'Mango',
    image: 'mango_gall_midge',
    cure_status: 'No cure is available for existing galls. Management focuses on monitoring new flushes and limiting midge damage.',
    description:
      'Gall midge infestation creates raised growths on leaves and can affect young shoots during flush.',
    short_description:
      'Leaf surfaces develop small raised galls and distorted growths.',
    symptoms:
      'Leaves develop small wart-like or pimple-like galls, often on the upper surface. Heavy damage can distort tender growth and reduce leaf quality.',
    cause:
      'Caused by gall midge insects that attack young leaves and shoots during active growth stages.',
    treatment:
      'Prune and remove heavily infested shoots. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label during the young flush stage.',
    prevention:
      'Inspect flushes early and manage pest pressure before population build-up. Keeping the orchard clean and monitored helps reduce infestation risk.',
    severity: 'medium',
  },
  {
    class_name: 'Mango___Healthy',
    display_name: 'Healthy Mango',
    crop: 'Mango',
    image: 'mango_healthy',
    cure_status: 'Not a disease; no cure is needed. Continue routine orchard care and monitoring.',
    description:
      'Healthy mango leaves are dark green, firm, and free from galls, powdery coating, or spots.',
    short_description:
      'Strong green foliage and clean leaf surfaces indicate a healthy tree.',
    symptoms:
      'Leaves remain glossy, even colored, and structurally sound without galls, powdery growth, or abnormal lesions.',
    cause:
      'This is the normal condition of a healthy mango tree with good nutrition and low pest pressure.',
    treatment:
      'Continue normal orchard care, balanced fertilization, and regular inspections. Good water management and sanitation maintain this condition.',
    prevention:
      'Regularly scout for pests and leaf disorders, and keep the canopy open to reduce stress. Healthy growth practices prevent many common issues.',
    severity: 'none',
  },
  {
    class_name: 'Mango___Powdery_Mildew',
    display_name: 'Mango Powdery Mildew',
    crop: 'Mango',
    image: 'mango_powdery_mildew',
    cure_status: 'No direct cure is available for damaged tissue. Management focuses on protecting new growth and limiting fungal spread.',
    description:
      'A fungal disease that appears as a white powdery coating on leaves, flowers, and fruits.',
    short_description:
      'White powdery fungal growth covers emerging leaves and blossoms.',
    symptoms:
      'Affected tissues are coated with a white, powder-like layer. The disease is especially visible on flower panicles and young fruit.',
    cause:
      'Caused by powdery mildew fungi when conditions are humid and susceptible growth stages are present.',
    treatment:
      'If fungicide use is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label at the blossom stage. Reduce excessive canopy moisture and maintain airflow.',
    prevention:
      'Monitor flowering and early fruit set carefully. Any preventive spray should be an appropriately registered product used according to the local agricultural extension recommendation and label. Keeping trees well spaced helps reduce infection risk.',
    severity: 'high',
  },
  {
    class_name: 'Mango___Sooty_Mould',
    display_name: 'Mango Sooty Mould',
    crop: 'Mango',
    image: 'mango_sooty_mould',
    cure_status: 'No direct cure is needed for the surface growth once its cause is addressed. Management focuses on controlling honeydew-producing insects.',
    description:
      'Sooty mould grows as a black coating on honeydew secreted by sap-sucking insects.',
    short_description:
      'Black velvety coating develops on leaves and fruit where honeydew settles.',
    symptoms:
      'Leaf and fruit surfaces become coated in a dark, soot-like film that reduces photosynthesis and makes the crop look dirty. The underlying issue is usually insect feeding.',
    cause:
      'The black mold itself grows on sugar-rich honeydew excreted by sap-sucking insects such as hoppers, mealybugs, and scales.',
    treatment:
      'Control sap-sucking insect populations using a suitable local treatment and wash the surface if necessary. Removing the source of honeydew is essential to reduce recurring mold growth.',
    prevention:
      'Regularly inspect the canopy for sucking insects and keep the orchard clean. Good pest management prevents the honeydew buildup that drives sooty mould.',
    severity: 'medium',
  },
  {
    class_name: 'Rice___Bacterial_Blight',
    display_name: 'Bacterial Leaf Blight',
    crop: 'Rice',
    image: 'rice_bacterial_blight',
    cure_status: 'No direct cure is available for infected plants. Management focuses on resistant varieties, field hygiene, and limiting spread.',
    description:
      'This bacterial leaf disease causes yellow strips along the veins and can rapidly reduce photosynthetic area.',
    short_description:
      'Yellow streaks along the leaf veins develop into blighted tissue.',
    symptoms:
      'Long yellowish-white streaks form along leaf veins and later turn brown and necrotic. Severe infection can affect large parts of the canopy and reduce grain filling.',
    cause:
      'Caused by Xanthomonas oryzae and favored by high humidity, warm temperatures, and infected plant debris.',
    treatment:
      'Remove infected plants or severely affected patches and use resistant rice varieties. If chemical control is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label. Avoid excessive nitrogen use.',
    prevention:
      'Plant clean seed, avoid infected crop residues, and monitor fields regularly. Balanced nutrient management and field hygiene help reduce early disease pressure.',
    severity: 'high',
  },
  {
    class_name: 'Rice___Blast',
    display_name: 'Rice Blast',
    crop: 'Rice',
    image: 'rice_blast',
    cure_status: 'No direct cure is available for infected tissue. Management focuses on resistant varieties, balanced crop care, and protecting healthy plants.',
    description:
      'Rice blast is a fungal disease that produces diamond-shaped lesions and can damage leaves and panicles.',
    short_description:
      'Diamond-shaped lesions with pale centers appear on leaves and heads.',
    symptoms:
      'Leaves show diamond or spindle-shaped lesions with grey centers and dark borders. Severe infections can damage panicles and reduce grain yield.',
    cause:
      'Caused by Magnaporthe oryzae and encouraged by cool nights, high humidity, and susceptible varieties.',
    treatment:
      'Use resistant varieties and maintain careful water management. If fungicide use is recommended, use an appropriately registered product according to the local agricultural extension recommendation and label.',
    prevention:
      'Use healthy seed, avoid dense canopy conditions, and monitor fields often during vulnerable periods. Good field sanitation and variety selection reduce the risk of severe outbreaks.',
    severity: 'high',
  },
  {
    class_name: 'Rice___Brown_Spot',
    display_name: 'Brown Spot',
    crop: 'Rice',
    image: 'rice_brown_spot',
    cure_status: 'No direct cure is available for existing lesions. Management focuses on crop vigor, clean seed, and reducing further infection.',
    description:
      'Brown spot is a common fungal disease that causes circular brown lesions on leaves and grains.',
    short_description:
      'Circular or oval brown spots appear on leaves and reduce crop vigor.',
    symptoms:
      'Leaves develop small circular to oval brown lesions with distinct borders. In severe cases, the disease also affects grains and can reduce overall yield.',
    cause:
      'Caused by Bipolaris oryzae and often linked to poor soil fertility, weak plant vigor, and persistent moisture stress.',
    treatment:
      'Improve soil fertility and field drainage and use certified seed. If fungicide use is recommended for severe infection, use an appropriately registered product according to the local agricultural extension recommendation and label.',
    prevention:
      'Keep the crop well nourished and avoid prolonged water stress. Regular scouting and managing residues help keep disease pressure low.',
    severity: 'medium',
  },
  {
    class_name: 'Rice___Tungro',
    display_name: 'Rice Tungro',
    crop: 'Rice',
    image: 'rice_tungro',
    cure_status: 'No direct cure is available. Management focuses on resistant varieties, early removal of infected plants, and leafhopper control.',
    description:
      'Rice tungro is a viral disease that causes yellowing, stunting, and poor tillering in infected plants.',
    short_description:
      'Plants turn yellow, stunt, and produce fewer tillers than healthy hills.',
    symptoms:
      'Leaves become yellow or orange-yellow and the plant remains short with reduced tillering. Grain development is poor and infected patches stand out in the field.',
    cause:
      'A viral disease transmitted by green leafhoppers, often moving from infected rice plants to nearby healthy crops.',
    treatment:
      'Control the leafhopper vector and remove infected plants from the field. Use resistant rice varieties and maintain regular field scouting to isolate outbreaks early.',
    prevention:
      'Plant healthy seed and manage vectors before outbreaks spread. Timing and field hygiene are important for preventing new infections.',
    severity: 'high',
  },
];

const diseaseImageMap = {
  cassava_bacterial_blight: require('../../assets/diseases/cassava_bacterial_blight.jpg'),
  cassava_brown_streak: require('../../assets/diseases/cassava_brown_streak.jpg'),
  cassava_green_mottle: require('../../assets/diseases/cassava_green_mottle.jpg'),
  cassava_healthy: require('../../assets/diseases/cassava_healthy.jpg'),
  cassava_mosaic: require('../../assets/diseases/cassava_mosaic.jpg'),
  coconut_gray_leaf_spot: require('../../assets/diseases/coconut_gray_leaf_spot.jpg'),
  coconut_leaf_rot: require('../../assets/diseases/coconut_leaf_rot.jpg'),
  jackfruit_algal_leaf_spot: require('../../assets/diseases/jackfruit_algal_leaf_spot.jpg'),
  jackfruit_black_spot: require('../../assets/diseases/jackfruit_black_spot.jpg'),
  jackfruit_healthy: require('../../assets/diseases/jackfruit_healthy.jpg'),
  mango_anthracnose: require('../../assets/diseases/mango_anthracnose.jpg'),
  mango_bacterial_canker: require('../../assets/diseases/mango_bacterial_canker.jpg'),
  mango_cutting_weevil: require('../../assets/diseases/mango_cutting_weevil.jpg'),
  mango_die_back: require('../../assets/diseases/mango_die_back.jpg'),
  mango_gall_midge: require('../../assets/diseases/mango_gall_midge.jpg'),
  mango_healthy: require('../../assets/diseases/mango_healthy.jpg'),
  mango_powdery_mildew: require('../../assets/diseases/mango_powdery_mildew.jpg'),
  mango_sooty_mould: require('../../assets/diseases/mango_sooty_mould.jpg'),
  rice_bacterial_blight: require('../../assets/diseases/rice_bacterial_blight.jpg'),
  rice_blast: require('../../assets/diseases/rice_blast.jpg'),
  rice_brown_spot: require('../../assets/diseases/rice_brown_spot.jpg'),
  rice_tungro: require('../../assets/diseases/rice_tungro.jpg'),
};

export const DISEASES_WITHOUT_VERIFIED_IMAGE = [];

export function getDiseaseImageAssetName(disease) {
  if (typeof disease?.image !== 'string' || !disease.image.trim()) {
    return null;
  }
  return String(disease.image)
    .toLowerCase()
    .replace(/___/g, '_')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getDiseaseImageSource(disease) {
  const id = getDiseaseImageAssetName(disease);
  if (!id) {
    return null;
  }
  const source = diseaseImageMap[id];
  if (!source) {
    throw new Error(`No local disease image is registered for ${disease?.class_name || 'unknown class'}.`);
  }
  return source;
}

export default diseaseInfo;
