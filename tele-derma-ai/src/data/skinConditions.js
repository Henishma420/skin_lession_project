const skinConditions = [
  {
    id: "melanocytic-nevi",
    name: "Melanocytic Nevi",
    scientificName: "Common Nevus / Mole",
    shortDescription: "Common benign skin growths formed by clusters of melanocytes.",
    category: "Benign",
    image: "/images/benign_nevus.jpg",
    imageCaption: "Clinical presentation of a symmetric, uniform benign melanocytic nevus.",
    imageAlt: "Close-up of a brown, round, symmetric melanocytic nevus on skin.",
    cancerStatus: "Non-cancerous / Benign",
    cancerStatusExplanation: "These are benign proliferations of melanocytes. They are entirely non-cancerous and do not spread, but they should be monitored for any changes using the ABCDE rule to rule out dysplastic features or early-stage melanoma.",
    overview: "Melanocytic nevi, commonly known as moles, are benign skin tumors composed of melanocytes—the pigment-producing cells of the skin. They can be congenital (present at birth) or acquired throughout life, typically appearing during childhood and adolescence. Nevi form when melanocytes grow in clusters rather than spreading evenly throughout the skin. They are extremely common, with most adults having between 10 and 40 nevi across their body.",
    symptoms: [
      "Color: Typically uniform shades of tan, brown, or black, though some can be skin-colored or pink.",
      "Shape: Symmetric, round or oval with sharp, well-defined borders.",
      "Texture: Can be flat (macular) or raised (papular), smooth, or rough, sometimes with hair growing from them.",
      "Size: Generally less than 6mm in diameter (about the size of a pencil eraser).",
      "Growth: Slowly evolve over decades, sometimes raising further, fading, or disappearing in old age."
    ],
    commonLocations: [
      "Sun-exposed areas such as the face, neck, arms, and legs.",
      "Trunk (chest, back, and abdomen).",
      "Can occasionally develop in less visible areas, such as the scalp, under nails, between toes, and on palms or soles."
    ],
    riskFactors: [
      "Genetics: Family history of numerous moles or dysplastic nevi.",
      "Sun Exposure: Exposure to ultraviolet (UV) radiation, particularly during childhood and adolescence, increases mole counts.",
      "Skin Type: Individuals with fair skin, light eyes, and freckles tend to develop more nevi."
    ],
    diagnosis: [
      "Physical Skin Examination: Visual assessment of the lesion's shape, symmetry, color, and size.",
      "Dermoscopy: Handheld microscopic visualization of the pigment network and vascular patterns by a dermatologist.",
      "Excisional Biopsy: If a mole displays atypical features (asymmetry, border irregularity, multiple colors, or rapid changes), the entire lesion is surgically removed and sent for histopathological examination to rule out melanoma."
    ],
    treatment: [
      "Observation & Monitoring: Most nevi require no treatment other than regular self-monitoring and annual dermatological checkups.",
      "Surgical Excision: Complete removal of the mole down to the subcutaneous fat, typically done if malignancy is suspected.",
      "Shave Removal: Shaving the raised portion of the mole level with the skin, often used for benign, cosmetically bothersome, or irritated moles."
    ],
    prevention: [
      "Sun Protection: Apply broad-spectrum SPF 30+ sunscreen daily to all exposed skin surfaces.",
      "Protective Clothing: Wear tightly woven clothing, wide-brimmed hats, and UV-blocking sunglasses.",
      "Avoid Sunbeds: Avoid artificial UV radiation from tanning beds.",
      "Regular Screenings: Perform monthly skin self-exams and schedule annual full-body evaluations with a dermatologist."
    ],
    warningSigns: [
      "A – Asymmetry: One half of the mole does not match the other.",
      "B – Border: Irregular, scalloped, notched, or poorly defined borders.",
      "C – Color: Variation in color, including shades of brown, black, red, white, or blue.",
      "D – Diameter: Larger than 6mm, though melanomas can sometimes be smaller.",
      "E – Evolving: Any change in size, shape, color, elevation, or symptoms (such as itching, bleeding, or crusting)."
    ],
    prognosis: "Excellent. Benign melanocytic nevi are harmless and do not affect life expectancy. However, individuals with a very high count of nevi (greater than 50-100) or atypical nevi have a statistically higher risk of developing melanoma elsewhere and require vigilant screening.",
    relatedConditions: ["melanoma", "benign-keratosis"]
  },
  {
    id: "melanoma",
    name: "Melanoma",
    scientificName: "Malignant Melanoma",
    shortDescription: "Highly aggressive skin cancer originating from melanocytes.",
    category: "Cancerous",
    image: "/images/melanoma_lesion.jpg",
    imageCaption: "Clinical view of an asymmetric malignant melanoma lesion displaying irregular borders and color variegation.",
    imageAlt: "Close-up of an irregular, dark-colored, multi-shaded melanoma lesion on skin.",
    cancerStatus: "Cancerous / Malignant",
    cancerStatusExplanation: "This is a malignant cancer of the melanocytes. It is highly invasive and has a high propensity to metastasize (spread) to lymph nodes and distant organs if not detected and treated in its early stages.",
    overview: "Melanoma is the most serious form of skin cancer, arising from the malignant transformation of melanocytes—the pigment-producing cells. While less common than basal cell or squamous cell carcinomas, melanoma is significantly more aggressive. It is primarily driven by DNA damage caused by exposure to ultraviolet (UV) radiation from sunlight or tanning beds, which triggers mutations leading to uncontrolled cell division. It can develop from an existing mole or appear as a new, abnormal spot.",
    symptoms: [
      "Asymmetry: The two halves of the lesion do not align in shape or pattern.",
      "Borders: Scalloped, jagged, notched, or blurred borders that blend into surrounding skin.",
      "Color: Variegated coloration showing shades of dark brown, black, tan, red, pink, blue, or white.",
      "Diameter: Frequently larger than 6mm, though early melanomas can be smaller.",
      "Evolution: Rapid change in size, shape, color, elevation, or development of new symptoms like bleeding, oozing, crusting, itching, or pain."
    ],
    commonLocations: [
      "Men: Most commonly occurs on the back, trunk, head, or neck.",
      "Women: Most commonly found on the lower legs, calves, and arms.",
      "Acral Lentiginous Melanoma: Can develop on non-sun-exposed areas like the palms, soles, and under the fingernails or toenails, particularly in dark-skinned individuals."
    ],
    riskFactors: [
      "UV Radiation: Intense, intermittent sun exposure leading to blistering sunburns, particularly in youth.",
      "Tanning Beds: Regular use of artificial ultraviolet radiation.",
      "Atypical Moles: Having dysplastic nevi or a high total number of moles (over 50).",
      "Skin Phenotype: Fair skin that burns easily, red or blonde hair, blue or green eyes.",
      "Genetics: Family or personal history of melanoma (associated with CDKN2A gene mutations).",
      "Immunosuppression: A weakened immune system due to medical treatments or conditions."
    ],
    diagnosis: [
      "Full-Body Skin Examination: Detailed visual inspection of all cutaneous surfaces.",
      "Dermoscopy: Microscopic evaluation to identify specific malignant criteria (pigment network disruption, atypical vascular loops).",
      "Excisional Biopsy: Gold standard diagnostic test involving surgical removal of the entire lesion with a narrow margin (1-3mm) for histopathological analysis to determine Breslow thickness and mitotic rate.",
      "Sentinel Lymph Node Biopsy (SLNB): Performed for lesions deeper than 0.8mm to check if cancer cells have spread to the local lymphatic basin."
    ],
    treatment: [
      "Wide Surgical Excision: Surgical removal of the tumor site with a standardized safety margin (0.5cm to 2.0cm depending on depth) to ensure no local cancer cells remain.",
      "Immunotherapy: Systemic drugs (e.g., checkpoint inhibitors like pembrolizumab or nivolumab) that boost the body's own immune system to fight advanced melanoma.",
      "Targeted Therapy: Medications that target specific mutated proteins (such as BRAF or MEK inhibitors) in patients whose tumors harbor these mutations.",
      "Chemotherapy & Radiation: Used as palliative care or local control for metastatic disease or specific locations (like brain metastases)."
    ],
    prevention: [
      "UV Avoidance: Limit direct sun exposure during peak hours (10 AM to 4 PM).",
      "Daily SPF: Apply broad-spectrum SPF 50+ sunscreen daily, reapplying every two hours outdoors.",
      "Physical Barriers: Wear UV-protective clothing (UPF 50+), wide-brimmed hats, and wrap-around sunglasses.",
      "Skin Inspections: Perform regular monthly self-examinations utilizing the ABCDE framework, and get checked professionally annually."
    ],
    warningSigns: [
      "Any lesion that displays asymmetry, irregular borders, multiple colors, or is larger than 6mm.",
      "A 'Ugly Duckling' sign: A spot that looks completely different from all other moles on the body.",
      "Symptomatic changes: A mole that suddenly begins to itch, hurt, bleed, or form a crust.",
      "A dark streak underneath a fingernail or toenail that is not caused by trauma."
    ],
    prognosis: "Highly dependent on the stage at diagnosis. The 5-year survival rate for localized melanoma (confined to the primary site) is over 99%. However, if the melanoma metastasizes to distant organs (Stage IV), the survival rate decreases significantly, highlighting the absolute critical necessity of early detection.",
    relatedConditions: ["melanocytic-nevi", "basal-cell-carcinoma"]
  },
  {
    id: "benign-keratosis",
    name: "Benign Keratosis-like Lesions",
    scientificName: "Seborrheic Keratosis",
    shortDescription: "Common non-cancerous skin growths with a waxy, 'stuck-on' appearance.",
    category: "Benign",
    image: "/images/benign_keratosis.jpg",
    imageCaption: "Typical clinical presentation of a seborrheic keratosis showing a brown, waxy, stuck-on appearance with a well-demarcated border.",
    imageAlt: "Close-up of a raised, waxy, brown seborrheic keratosis growth on skin.",
    cancerStatus: "Non-cancerous / Benign",
    cancerStatusExplanation: "These lesions are entirely benign epidermal proliferations. They have zero malignant potential, meaning they do not develop into cancer or spread to other parts of the body.",
    overview: "Benign keratosis-like lesions, primarily represented by Seborrheic Keratoses, are extremely common non-cancerous skin growths that arise from keratinocytes in the outer layer of the skin. They are age-related growths, rarely appearing before age 30 and increasing in number with advancing years. The exact cause is unknown, though genetics play a major role. Because they can sometimes accumulate dark pigment or develop irregular borders, they are frequently mistaken for melanoma or basal cell carcinoma.",
    symptoms: [
      "Appearance: Raised, waxy, scaly, or crusty growths that look like they have been pasted or 'stuck on' the skin.",
      "Color: Ranges widely from light tan, yellow, and medium brown to deep black.",
      "Texture: Can range from smooth and velvety to rough, warty, and easily crumbled.",
      "Size: Typically varies from small spots of a few millimeters to large plaques exceeding 2.5 centimeters.",
      "Symptoms: Generally asymptomatic, but can become irritated, itchy, or bleed if rubbed by clothing or jewelry."
    ],
    commonLocations: [
      "Trunk (chest, back, and abdomen) is the most common site.",
      "Face, neck, scalp, and shoulders.",
      "Can occur anywhere on the body except the palms of the hands and the soles of the feet."
    ],
    riskFactors: [
      "Age: Significantly more common in individuals over the age of 50.",
      "Genetics: Tendency to inherit multiple seborrheic keratoses in a family pattern.",
      "Skin Pigmentation: More frequently found in individuals with lighter skin tones."
    ],
    diagnosis: [
      "Visual Examination: Most are easily diagnosed by a dermatologist using characteristic clinical signs (waxy texture, clear borders, lack of induration).",
      "Dermoscopy: Reveals characteristic pseudofollicular openings (comedo-like openings) and milia-like cysts.",
      "Biopsy: A shave biopsy is performed if the lesion is intensely black, bleeds spontaneously, or exhibits features overlapping with melanoma or squamous cell carcinoma."
    ],
    treatment: [
      "Observation: No medical intervention is required; they can safely be left alone.",
      "Cryotherapy: Application of liquid nitrogen to freeze and destroy the growth, causing it to fall off in a few weeks.",
      "Curettage & Electrodesiccation: Scraping off the lesion with a curette and applying a light electrical current to stop bleeding.",
      "Shave Excision: Shaving the lesion off flush with the skin surface under local anesthesia."
    ],
    prevention: [
      "No Prevention Available: Seborrheic keratoses are a natural consequence of cutaneous aging and cannot be prevented.",
      "Skin Hygiene: Avoid picking, scratching, or trying to remove the growths yourself, as this can lead to infection, irritation, and scarring."
    ],
    warningSigns: [
      "Rapid growth or sudden inflammation of a previously stable lesion.",
      "Spontaneous bleeding, oozing, or ulceration without physical trauma.",
      "A lesion that does not share the typical 'waxy' appearance and instead feels hard, indurated, or is surrounded by a red, inflamed border."
    ],
    prognosis: "Excellent. These lesions are completely harmless and never become cancerous. Removal is highly effective with minimal scarring, though new lesions may continue to form elsewhere as part of the aging process.",
    relatedConditions: ["melanocytic-nevi", "dermatofibroma"]
  },
  {
    id: "basal-cell-carcinoma",
    name: "Basal Cell Carcinoma",
    scientificName: "BCC",
    shortDescription: "Slow-growing, local skin cancer arising from the basal layer of the epidermis.",
    category: "Cancerous",
    image: "/images/basal_cell_carcinoma.jpg",
    imageCaption: "Clinical view of a nodular basal cell carcinoma showing a pearly pink papule with visible telangiectasia (blood vessels).",
    imageAlt: "Close-up of a pearly pink nodular basal cell carcinoma lesion with visible tiny blood vessels on the nose.",
    cancerStatus: "Cancerous / Malignant",
    cancerStatusExplanation: "This is a malignant skin cancer. While it is highly destructive to local tissue (invading skin, cartilage, and bone if left untreated), it is extremely slow-growing and has an exceptionally low rate of metastasis (less than 0.1%).",
    overview: "Basal Cell Carcinoma (BCC) is the most common cancer diagnosed worldwide. It arises from the basal cells located in the deepest layer of the epidermis. The primary driver of BCC is cumulative exposure to ultraviolet (UV) radiation from the sun, which induces DNA mutations in these cells. BCCs grow very slowly and are rarely life-threatening, but if ignored, they can cause extensive local destruction, ulceration ('rodent ulcer'), and cosmetic disfigurement.",
    symptoms: [
      "Nodular BCC: A pearly, shiny, waxy bump, often pink, red, or white, with visible tiny blood vessels (telangiectasias) spidering across the surface.",
      "Superficial BCC: A flat, scaly, reddish patch that slowly expands, often mistaken for eczema or psoriasis.",
      "Morpheaform/Sclerosing BCC: A firm, white, yellow, or flesh-colored flat scar-like lesion with poorly defined borders, which is the most aggressive subtype.",
      "Pigmented BCC: Similar to nodular but contains dark pigment, resembling melanoma.",
      "Non-healing Sore: A sore that repeatedly bleeds, crusts over, heals partially, and then bleeds again."
    ],
    commonLocations: [
      "Highly sun-exposed areas: Face (especially the nose, forehead, and eyelids), neck, ears, and scalp.",
      "Upper torso, shoulders, and backs of hands."
    ],
    riskFactors: [
      "Chronic UV Exposure: Long-term exposure to sunlight, outdoor employment, or recreational sun activities.",
      "Fair Skin: Individuals who burn easily, have red/blonde hair, and light eyes.",
      "Age: Most common in people over 50, although rates in younger adults are increasing due to tanning beds.",
      "Arsenic Exposure: Historic or environmental exposure to arsenic compounds.",
      "Genetics: Conditions like Gorlin syndrome (Nevoid Basal Cell Carcinoma Syndrome)."
    ],
    diagnosis: [
      "Physical Skin Examination: Detailed visual inspection.",
      "Dermoscopy: Identifies classic BCC features: shiny white areas, leaf-like structures, arborizing telangiectasias, and blue-gray ovoid nests.",
      "Skin Biopsy: A shave or punch biopsy is performed to confirm diagnosis and determine the specific histological subtype, which guides treatment."
    ],
    treatment: [
      "Mohs Micrographic Surgery: Specialized tissue-sparing surgery where layers of cancer are removed and examined microscopically in real-time until clear margins are reached. Highly recommended for facial lesions.",
      "Standard Surgical Excision: Removing the tumor along with a safety margin of healthy skin (typically 4mm).",
      "Curettage & Electrodesiccation (C&E): Scraping away the soft tumor tissue and using an electric needle to cauterize the base, common for superficial tumors on trunk.",
      "Topical Therapy: Prescription creams like Imiquimod or 5-Fluorouracil (5-FU) for superficial BCCs.",
      "Radiation Therapy: Used when surgery is not feasible due to patient health or tumor location."
    ],
    prevention: [
      "Sunscreen: Daily broad-spectrum SPF 30+ sunscreen applied to sun-exposed areas.",
      "Protective Gear: Wide-brimmed hats, sunglasses, and long sleeves.",
      "Peak Hour Avoidance: Avoid outdoor activities when UV levels are highest (midday).",
      "Routine Exams: Monthly skin self-inspection and annual clinical skin checks."
    ],
    warningSigns: [
      "A shiny, pearly pink bump that slowly grows.",
      "A sore that bleeds, oozes, or crusts and doesn't heal within 3 to 4 weeks.",
      "An unexplained scar-like lesion in an area that has not sustained any trauma."
    ],
    prognosis: "Excellent. When detected early and treated appropriately, the cure rate for basal cell carcinoma exceeds 95-99%. The prognosis is slightly guarded only for morpheaform subtypes or recurrent lesions, which require aggressive surgical intervention to prevent deep tissue infiltration.",
    relatedConditions: ["actinic-keratosis", "melanoma"]
  },
  {
    id: "actinic-keratosis",
    name: "Actinic Keratoses and Intraepithelial Carcinoma",
    scientificName: "Actinic Keratosis / Bowen's Disease",
    shortDescription: "Pre-cancerous rough, scaly patches that can progress to squamous cell carcinoma.",
    category: "Precancerous",
    image: "/images/actinic_keratosis.jpg",
    imageCaption: "Clinical presentation of actinic keratosis showing rough, scaly, erythematous patches on sun-damaged skin.",
    imageAlt: "Close-up of rough, scaly, reddish actinic keratosis patches on a scalp.",
    cancerStatus: "Precancerous",
    cancerStatusExplanation: "These lesions are precancerous. While benign in their current state, they represent early atypical cellular changes in keratinocytes. If left untreated, 5-10% of actinic keratoses will progress into invasive Squamous Cell Carcinoma (SCC).",
    overview: "Actinic Keratosis (AK), also known as solar keratosis, is a common pre-cancerous skin lesion caused by cumulative DNA damage from long-term exposure to ultraviolet (UV) radiation. Intraepithelial Carcinoma (Bowen's disease) is Squamous Cell Carcinoma in situ, representing a slightly more advanced stage where malignant cells occupy the entire thickness of the epidermis but have not yet breached the basement membrane. These conditions arise from atypical keratinocytes and are indicators of heavily sun-damaged skin.",
    symptoms: [
      "Texture: Rough, dry, scaly patch that feels like sandpaper when touched. Often felt before it is seen.",
      "Color: Pink, red, brown, tan, or flesh-colored, sometimes with a yellowish scaly crust.",
      "Size: Typically small, ranging from 2mm to 2cm in diameter.",
      "Elevation: Flat to slightly raised, or appearing as a hard, horn-like projection (cutaneous horn).",
      "Sensation: May itch, sting, burn, or feel tender when touched or rubbed."
    ],
    commonLocations: [
      "Sun-damaged areas: Face (nose, cheeks, forehead), ears, and lips (actinic cheilitis).",
      "Bald scalp of men and the back of the neck.",
      "Forearms and backs of the hands."
    ],
    riskFactors: [
      "Chronic Sun Exposure: Lifetime cumulative UV radiation from outdoor careers, hobbies, or sunbathing.",
      "Fair Complexion: Fair skin, blonde/red hair, blue eyes, and tendency to burn.",
      "Age: Most common in people over 40.",
      "Immunosuppression: Organ transplant recipients on immunosuppressant medications have a 100-fold higher risk of developing AKs and SCCs."
    ],
    diagnosis: [
      "Clinical Examination: Palpation (feeling the characteristic rough texture) and visual inspection under good lighting.",
      "Dermoscopy: Reveals a characteristic 'strawberry pattern' (erythematous pseudonetwork with white-yellow follicular openings).",
      "Skin Biopsy: Shave or punch biopsy is indicated if a lesion is thick, indurated, painful, bleeding, or failing to respond to therapy, to rule out progression to invasive squamous cell carcinoma."
    ],
    treatment: [
      "Cryotherapy: Freezing individual lesions with liquid nitrogen, which causes the patch to blister, crust, and peel off.",
      "Topical Field Therapies: Prescription creams applied to larger areas of sun damage to treat visible and sub-clinical lesions. Common agents include 5-Fluorouracil (5-FU) cream, Imiquimod cream, or Tirbanibulin ointment.",
      "Photodynamic Therapy (PDT): Applying a photosensitizing agent (ALA) to the skin, followed by exposure to a specific wavelength of light to selectively destroy abnormal cells.",
      "Curettage & Desiccation: Scraping off the lesion, useful for thicker or hypertrophic AKs."
    ],
    prevention: [
      "Strict Sun Protection: Daily use of broad-spectrum SPF 30+ sunscreen, even on cloudy days.",
      "Cover Up: Wear wide-brimmed hats, long sleeves, and UPF-rated clothing.",
      "Avoid Peak Hours: Stay in the shade between 10 AM and 4 PM.",
      "Regular Monitoring: Perform regular skin self-checks, paying attention to rough patches that do not resolve with moisturizer."
    ],
    warningSigns: [
      "An Actinic Keratosis that becomes thick, raised, hard, or tender.",
      "A lesion that bleeds spontaneously or develops a persistent open sore.",
      "Rapid growth in size or thickness of a previously flat scaly patch."
    ],
    prognosis: "Excellent if treated early. Most AKs are successfully cleared before they can transform into cancer. However, their presence indicates significant cumulative UV damage, meaning the patient is at higher risk for developing other skin cancers and needs close long-term dermatological surveillance.",
    relatedConditions: ["basal-cell-carcinoma", "melanoma"]
  },
  {
    id: "vascular-lesions",
    name: "Vascular Lesions",
    scientificName: "Cherry Hemangioma / Angioma",
    shortDescription: "Benign skin abnormalities formed by abnormal collections of blood vessels.",
    category: "Vascular",
    image: "/images/vascular_lesion.jpg",
    imageCaption: "Clinical presentation of a benign cherry hemangioma showing a bright red, well-circumscribed vascular papule.",
    imageAlt: "Close-up of a small, bright red, round cherry hemangioma on skin.",
    cancerStatus: "Non-cancerous / Benign",
    cancerStatusExplanation: "These lesions are entirely benign vascular proliferations. They consist of normal or dilated blood vessels and have absolutely zero malignant potential.",
    overview: "Vascular lesions of the skin encompass a wide variety of abnormalities, primarily represented by Cherry Hemangiomas (senile angiomas). These are benign vascular growths composed of clusters of capillaries. They are extremely common in adults and increase in frequency with age. Other vascular lesions include pyogenic granulomas, port-wine stains, spider angiomas, and venous lakes. They occur when small blood vessels multiply abnormally or dilate near the skin surface.",
    symptoms: [
      "Color: Bright red, ruby red, purple, or blue.",
      "Shape: Small, round, or oval spots with smooth, well-defined edges.",
      "Texture: Can be flat and flush with the skin (macular) or raised, dome-shaped bumps (papular).",
      "Size: Typically small, ranging from pinhead-sized (1mm) to about 5mm in diameter.",
      "Sensation: Painless, but can bleed profusely if scratched, bumped, or shaved over."
    ],
    commonLocations: [
      "Most commonly found on the trunk (chest, abdomen, and back).",
      "Can occur on the limbs (arms and legs), neck, and shoulders.",
      "Rarely found on the face, palms, or soles."
    ],
    riskFactors: [
      "Age: Very common in people over 30, and counts increase progressively with age.",
      "Genetics: Family history of developing multiple cherry hemangiomas.",
      "Hormones: Pregnancy or exposure to certain chemicals can trigger eruptive vascular lesions.",
      "Climate: Hotter climates are associated with higher report rates, though not causative."
    ],
    diagnosis: [
      "Visual Examination: Diagnosed clinically based on bright red color, compressible nature, and round shape.",
      "Dermoscopy: Shows characteristic red, purple, or blue-black lacunae (blood-filled spaces) and septae.",
      "Skin Biopsy: Done if the lesion is dark purple or black, mimics nodular melanoma, or grows rapidly (like a pyogenic granuloma)."
    ],
    treatment: [
      "Observation: No medical treatment is necessary; they are harmless.",
      "Pulsed Dye Laser (PDL): High-intensity light therapy that selectively destroys the blood vessels, often the best cosmetic result.",
      "Electrosurgery / Electrocautery: Burning the tissue with an electric current to remove the lesion and seal the blood vessels.",
      "Cryotherapy: Freezing the lesion with liquid nitrogen, causing it to fall off.",
      "Shave Excision: Surgically shaving the bump level with the skin, useful if it constantly catches on clothing."
    ],
    prevention: [
      "No Prevention Available: Most vascular lesions are developmental, genetic, or age-related and cannot be prevented.",
      "Protection: Take care when shaving or exfoliating to avoid cutting raised vascular bumps, as they bleed heavily."
    ],
    warningSigns: [
      "A vascular lesion that grows rapidly over a few days or weeks.",
      "Spontaneous bleeding that is difficult to stop.",
      "A lesion that turns dark black, develops asymmetric borders, or becomes firm and painful (ulcerated pyogenic granuloma or amelanotic melanoma mimic)."
    ],
    prognosis: "Excellent. Vascular lesions are benign and do not pose any threat to health. Laser or cautery treatment is highly curative, although patients will likely develop new angiomas as they continue to age.",
    relatedConditions: ["dermatofibroma", "benign-keratosis"]
  },
  {
    id: "dermatofibroma",
    name: "Dermatofibroma",
    scientificName: "Benign Fibrous Histiocytoma",
    shortDescription: "Common, harmless firm nodules that develop within the deeper layers of the skin.",
    category: "Benign",
    image: "/images/dermatofibroma.jpg",
    imageCaption: "Clinical presentation of a firm, hyperpigmented dermatofibroma showing the characteristic 'dimple sign' when pinched.",
    imageAlt: "Close-up of a small, firm, brownish dermatofibroma nodule on the lower leg.",
    cancerStatus: "Non-cancerous / Benign",
    cancerStatusExplanation: "This is a benign fibrous growth within the dermis. It does not possess malignant potential and does not metastasize, though it remains permanently unless surgically removed.",
    overview: "A dermatofibroma is a common, benign, slow-growing skin nodule that develops in the dermis (the deep layer of the skin). It consists of a mixture of fibroblasts, histiocytes, and collagen. While the exact trigger is unknown, they frequently develop at the site of minor skin injuries, such as insect bites, thorn pricks, or ingrown hairs. They are notable for being extremely firm to the touch, often described as feeling like a small pebble embedded under the skin.",
    symptoms: [
      "Texture: Very firm or hard nodule that sits within the skin rather than on top of it.",
      "Color: Ranges from pink, red, to dull brown, grey, or purple. The border is often darker than the center.",
      "Size: Typically small, ranging from 3mm to 10mm (less than 1cm) in diameter.",
      "Dimple Sign: A key clinical sign where the nodule dimples inward when pinched between the thumb and index finger.",
      "Sensation: Usually asymptomatic, but can be slightly itchy, tender, or painful when pressed."
    ],
    commonLocations: [
      "Most commonly found on the lower legs (particularly in women).",
      "Can occur on the arms, shoulders, and trunk.",
      "Rarely found on the head or neck."
    ],
    riskFactors: [
      "Minor Skin Trauma: Insect bites, minor cuts, shaver nicks, or splinter injuries.",
      "Age: Most common in young to middle-aged adults (20-40 years old).",
      "Gender: More frequently observed in women than in men."
    ],
    diagnosis: [
      "Physical Examination & Palpation: Squeezing the skin to elicit the dimple sign.",
      "Dermoscopy: Shows a characteristic central white patch/scar-like area surrounded by a delicate pigment network.",
      "Skin Biopsy: A punch or excisional biopsy is performed if the lesion is atypical, highly pigmented (mimicking melanoma), or growing, to confirm the diagnosis of fibrous histiocytoma."
    ],
    treatment: [
      "Observation: Dermatofibromas are completely harmless and are best left alone.",
      "Surgical Excision: Complete removal of the nodule down into the subcutaneous fat. Since the lesion is deep, this always leaves a visible scar, which is often more noticeable than the original bump.",
      "Cryotherapy: Liquid nitrogen freezing can be used to freeze and flatten the top of the nodule, reducing its size and irritation, though it rarely removes it completely."
    ],
    prevention: [
      "Trauma Avoidance: Avoid scratching insect bites and take care when shaving legs to prevent minor cuts.",
      "General Care: Do not squeeze or attempt to puncture the nodule, as it consists of dense scar tissue and will not pop."
    ],
    warningSigns: [
      "Rapid growth, changing color, or spreading borders.",
      "Spontaneous bleeding, crusting, or ulceration.",
      "Development of severe pain or rapid increase in number of lesions."
    ],
    prognosis: "Excellent. These nodules are completely benign and do not develop into cancer. They typically persist indefinitely without changing, and surgical removal is curative, though it leaves a permanent scar.",
    relatedConditions: ["benign-keratosis", "melanocytic-nevi"]
  }
];

export default skinConditions;
