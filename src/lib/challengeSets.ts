// src/lib/challengeSets.ts
export type Challenge = {
  id: number;
  title: string;
  description: string;
  points: number;
  emoji?: string;
};

/** Normal app list */
export const MAIN_CHALLENGES: Challenge[] = [
    { id: 1,  title: "New Friend Selfie",         description: "Take a selfie with someone you just met today.", points: 15, emoji: "📸" },
    { id: 2,  title: "Ask the Way",               description: "Ask a stranger for directions and snap a quick selfie.", points: 15, emoji: "🗺️" },
    { id: 3,  title: "Triple High-Five",          description: "High-five 3 different people and capture it.", points: 15, emoji: "✋" },
    { id: 4,  title: "Door Hero",                 description: "Hold the door open for someone and take a photo.", points: 10, emoji: "🚪" },
    { id: 5,  title: "Compliment Snapshot",       description: "Give someone a compliment and take a selfie with them.", points: 15, emoji: "😊" },
    { id: 6,  title: "Language Swap",             description: "Learn one word in another language from someone and record it.", points: 20, emoji: "🌍" },
    { id: 7,  title: "Handshake Shot",            description: "Shake hands with someone new and take a photo mid-shake.", points: 15, emoji: "🤝" },
    { id: 8,  title: "Group Pic",                 description: "Take a group selfie with at least 3 people.", points: 10, emoji: "👥" },
    { id: 9,  title: "Song Share",                description: "Ask someone about their favorite song and record their answer.", points: 15, emoji: "🎶" },
    { id: 10, title: "Snack Share",               description: "Share your snack with someone and snap a picture of it.", points: 10, emoji: "🍎" },

    { id: 11, title: "Sticky Note Smile",         description: "Leave a positive sticky note and take a photo of it.", points: 10, emoji: "📝" },
    { id: 12, title: "Coffee Treat",              description: "Buy a coffee/tea for someone and take a photo together.", points: 15, emoji: "☕" },
    { id: 13, title: "Flower Power",              description: "Give a flower to someone and snap the moment.", points: 15, emoji: "🌸" },
    { id: 14, title: "Why You’re Awesome",        description: "Record a 5-second video telling someone why they are awesome.", points: 15, emoji: "🎥" },
    { id: 15, title: "Umbrella Buddy",            description: "Share your umbrella with someone and take a picture.", points: 10, emoji: "🌂" },
    { id: 16, title: "Thank-You Note",            description: "Write a thank-you message and give it to someone.", points: 10, emoji: "🙏" },
    { id: 17, title: "Little Help",               description: "Lend someone a small item and capture the exchange.", points: 10, emoji: "🤲" },
    { id: 18, title: "Generations Photo",         description: "Take a picture with someone 15 years older than you.", points: 10, emoji: "👴" },
    { id: 19, title: "Funny Thank-You",           description: "Say thank you in a funny way and record the reaction.", points: 10, emoji: "😂" },
    { id: 20, title: "Candy Share",               description: "Offer candy/gum to someone and snap a photo.", points: 10, emoji: "🍬" },

    { id: 21, title: "Rock-Paper-Scissors",       description: "Play rock-paper-scissors with someone and capture it.", points: 10, emoji: "✊" },
    { id: 22, title: "Secret Handshake",          description: "Teach someone a handshake and take a photo doing it together.", points: 15, emoji: "🤜🤛" },
    { id: 23, title: "Matching Outfit",           description: "Find someone wearing your color and take a photo.", points: 10, emoji: "👕" },
    { id: 24, title: "Clap Sync",                 description: "Record a 5-second video clapping in sync with a friend.", points: 15, emoji: "👏" },
    { id: 25, title: "Co-Draw",                   description: "Draw something together and snap a photo of the result.", points: 15, emoji: "✏️" },
    { id: 26, title: "Mirror Pose",               description: "Copy someone’s pose exactly and take a picture.", points: 10, emoji: "🪞" },
    { id: 27, title: "Living Statues",            description: "Pose like statues with 2 people and take a photo.", points: 15, emoji: "🗿" },
    { id: 28, title: "Jump Shot",                 description: "Take a jumping photo with someone else.", points: 15, emoji: "🤸" },
    { id: 29, title: "Thumb War",                 description: "Play a thumb war and record it.", points: 10, emoji: "👍" },
    { id: 30, title: "Balance Together",          description: "Balance an object with someone and snap a picture.", points: 15, emoji: "⚖️" },

    { id: 31, title: "Silly Face Selfie",         description: "Take a selfie with someone making silly faces.", points: 10, emoji: "😜" },
    { id: 32, title: "Dance Duo",                 description: "Record a short dance video with another person.", points: 20, emoji: "💃" },
    { id: 33, title: "Shoe Swap",                 description: "Pretend to swap shoes with someone and take a photo.", points: 10, emoji: "👟" },
    { id: 34, title: "Hand Smiley",               description: "Draw a smiley on your hand and take a selfie with it.", points: 5, emoji: "✋" },
    { id: 35, title: "Heart Hands",               description: "Make a heart shape with someone and take a photo.", points: 10, emoji: "❤️" },
    { id: 36, title: "Tell a Joke",               description: "Record a short video telling a joke to a friend.", points: 10, emoji: "🎤" },
    { id: 37, title: "Twin Pose",                 description: "Pose the same way as someone else and take a photo.", points: 10, emoji: "👯" },
    { id: 38, title: "Shades Squad",              description: "Take a selfie with someone wearing sunglasses.", points: 5, emoji: "🕶️" },
    { id: 39, title: "Hold Them Up",              description: "Create a photo where you ‘hold’ someone in your hand.", points: 15, emoji: "✋" },
    { id: 40, title: "Fake Band",                 description: "Pretend to be in a band with random objects as instruments.", points: 15, emoji: "🥁" },

    { id: 41, title: "Thumbs-Up Stranger",        description: "Ask a stranger for a thumbs-up selfie.", points: 15, emoji: "👍" },
    { id: 42, title: "Hello in Another Language", description: "Record someone greeting you in their language.", points: 20, emoji: "🌎" },
    { id: 43, title: "Helping Hand",              description: "Help someone carry something and take a photo.", points: 20, emoji: "🛒" },
    { id: 44, title: "Smile With Service",        description: "Take a selfie with a cashier, driver, or worker.", points: 15, emoji: "🚌" },
    { id: 45, title: "Fist Bump Stranger",        description: "Give a fist bump to a stranger and take a picture.", points: 15, emoji: "👊" },
    { id: 46, title: "Superhero Pose",            description: "Ask someone to pose like a superhero with you.", points: 15, emoji: "🦸" },
    { id: 47, title: "Pet Photo",                 description: "Take a picture with someone’s pet (with permission).", points: 10, emoji: "🐕" },
    { id: 48, title: "Funny Face Worker",         description: "Snap a funny face selfie with a shop worker.", points: 15, emoji: "😆" },
    { id: 49, title: "Circle of Hands",           description: "Take a picture of several hands joined in a circle.", points: 10, emoji: "🖐️" },
    { id: 50, title: "Mini Pyramid",              description: "Create a tiny human pyramid and snap a picture.", points: 20},
    [
      { id: 51, title: "Smile Squad",              description: "Take a photo with 5 people smiling.", points: 20, emoji: "😄" },
      { id: 52, title: "Word with Bodies",         description: "Spell out a short word with people’s arms and snap a photo.", points: 20, emoji: "🔤" },
      { id: 53, title: "Tongue Out",               description: "Take a group selfie where everyone sticks out their tongue.", points: 10, emoji: "👅" },
      { id: 54, title: "Peace Pic",                description: "Take a group photo where everyone shows the peace sign.", points: 10, emoji: "✌️" },
      { id: 55, title: "Shout Out",                description: "Record 3 people shouting 'Have a nice day!' together.", points: 20, emoji: "📢" },
      { id: 56, title: "Hat Hunters",              description: "Take a picture of 4 people wearing hats.", points: 15, emoji: "👒" },
      { id: 57, title: "Laugh Squad",              description: "Snap a photo where at least 3 people are laughing.", points: 15, emoji: "😂" },
      { id: 58, title: "Wave Train",               description: "Record 2 strangers waving at the camera at the same time.", points: 15, emoji: "👋" },
      { id: 59, title: "Circle Pose",              description: "Take a group photo where everyone forms a circle facing outward.", points: 15, emoji: "⭕" },
      { id: 60, title: "Group Cheer",              description: "Record a short video of a group cheer with at least 3 people.", points: 20, emoji: "🙌" },

      { id: 61, title: "Piggyback Ride",           description: "Give or get a piggyback ride and snap a picture.", points: 20, emoji: "🏋️" },
      { id: 62, title: "TikTok Move",              description: "Teach someone a TikTok dance move and record it.", points: 20, emoji: "🎶" },
      { id: 63, title: "Hat Swap",                 description: "Swap hats with someone and take a photo.", points: 15, emoji: "🎩" },
      { id: 64, title: "Strong Friend",            description: "Let someone lift you for a second and take a photo.", points: 20, emoji: "💪" },
      { id: 65, title: "Pushup Buddy",             description: "Do pushups next to someone and take a picture.", points: 15, emoji: "🤸" },
      { id: 66, title: "Signature Pose",           description: "Teach someone your signature pose and take a picture together.", points: 15, emoji: "🧍" },
      { id: 67, title: "Hello Train",              description: "Record a short clip saying 'hello' to 3 people in a row.", points: 15, emoji: "👋" },
      { id: 68, title: "Shoeless Squad",           description: "Take a group photo where everyone is barefoot.", points: 10, emoji: "🦶" },
      { id: 69, title: "Magazine Cover",           description: "Stage a fake magazine cover pose with random people.", points: 20, emoji: "📖" },
      { id: 70, title: "Shop Thumbs-Up",           description: "Take a picture giving a thumbs-up with a stranger in a shop.", points: 15, emoji: "👍" },

      { id: 71, title: "Handshake Routine",        description: "Record a 10-second handshake routine with someone.", points: 20, emoji: "🤲" },
      { id: 72, title: "Hat Exchange",             description: "Exchange hats with a stranger and take a photo.", points: 15, emoji: "🎩" },
      { id: 73, title: "Camera Swap",              description: "Let a stranger hold your phone/camera and take their photo.", points: 20, emoji: "📱" },
      { id: 74, title: "Sing Together",            description: "Record a short video singing one line of a song with someone.", points: 20, emoji: "🎤" },
      { id: 75, title: "Wave Squad",               description: "Get 3 strangers to wave at once and snap a photo.", points: 20, emoji: "👋" },
      { id: 76, title: "Bag Holder",               description: "Take a picture of someone else holding your bag.", points: 15, emoji: "🎒" },
      { id: 77, title: "Dance Trio",               description: "Record a short clip dancing with 2 people.", points: 20, emoji: "💃" },
      { id: 78, title: "Hand Name",                description: "Write your name on someone’s hand and take a photo.", points: 10, emoji: "✍️" },
      { id: 79, title: "Funny Word",               description: "Record someone teaching you a funny or unusual word.", points: 15, emoji: "🗣️" },
      { id: 80, title: "Job Swap",                 description: "Pretend to swap jobs with someone and take a picture.", points: 20, emoji: "👔" },

      { id: 81, title: "Water Boost",              description: "Drink a full glass of water and take a photo with it.", points: 5, emoji: "💧" },
      { id: 82, title: "10-Minute Walk",           description: "Go for a 10-minute walk and snap a photo of your view.", points: 10, emoji: "🚶" },
      { id: 83, title: "Stretch Break",            description: "Do a quick stretch and capture a photo mid-stretch.", points: 10, emoji: "🤸" },
      { id: 84, title: "Fruit Snack",              description: "Eat a fruit today and take a picture holding it.", points: 10, emoji: "🍌" },
      { id: 85, title: "Deep Breathing",           description: "Record a 5-second video of yourself taking deep breaths.", points: 5, emoji: "🌬️" },
      { id: 86, title: "Bedtime Ready",            description: "Show a photo of your phone charging before bed.", points: 5, emoji: "📱" },
      { id: 87, title: "Morning Sunshine",         description: "Take a photo of the morning sun or your breakfast.", points: 10, emoji: "🌅" },
      { id: 88, title: "Steps Count",              description: "Take a screenshot of your pedometer showing today’s steps.", points: 15, emoji: "📊" },
      { id: 89, title: "Healthy Lunch",            description: "Take a picture of a healthy meal you ate today.", points: 15, emoji: "🥗" },
      { id: 90, title: "Hydration Check",          description: "Record a short clip filling your water bottle.", points: 10, emoji: "🚰" },

      { id: 91, title: "Paparazzi Shot",           description: "Pretend to be paparazzi and snap someone posing.", points: 15, emoji: "📷" },
      { id: 92, title: "Street Vendor",            description: "Pretend to sell something funny and take a photo.", points: 15, emoji: "🛒" },
      { id: 93, title: "Dance Teacher",            description: "Record a stranger teaching you a dance step.", points: 20, emoji: "🕺" },
      { id: 94, title: "Glasses Crew",             description: "Take a photo with at least 3 people wearing glasses.", points: 15, emoji: "👓" },
      { id: 95, title: "Living Sculptures",        description: "Get 3 people to pose like statues.", points: 15, emoji: "🗽" },
      { id: 96, title: "Push & Pull",              description: "Take a funny photo pretending to push or pull someone.", points: 15, emoji: "🤼" },
      { id: 97, title: "Good Luck Clip",           description: "Record someone telling you 'Good luck!'", points: 15, emoji: "🍀" },
      { id: 98, title: "Shock Squad",              description: "Take a group photo where everyone looks surprised.", points: 15, emoji: "😲" },
      { id: 99, title: "Bag Swap",                 description: "Pretend to swap bags with someone and take a photo.", points: 15, emoji: "👜" },
      { id: 100,title: "Big Finale Selfie",        description: "Take a group selfie with as many people as possible.", points: 20, emoji: "🤳" },
      [
        { id: 101, title: "Coffee Cheers",            description: "Clink your coffee or tea with someone and snap a photo.", points: 10, emoji: "☕" },
        { id: 102, title: "Peace with a Stranger",    description: "Take a peace-sign selfie with someone you don’t know.", points: 15, emoji: "✌️" },
        { id: 103, title: "Secret Word",              description: "Ask someone to whisper a secret word to you and record it.", points: 20, emoji: "🤫" },
        { id: 104, title: "Photo Bomb",               description: "Get into someone’s photo with their permission.", points: 15, emoji: "📸" },
        { id: 105, title: "Laugh Selfie",             description: "Take a selfie while laughing with someone else.", points: 10, emoji: "🤣" },
        { id: 106, title: "Work Buddy",               description: "Take a photo with a colleague holding your tools or laptop.", points: 10, emoji: "💼" },
        { id: 107, title: "Victory Pose",             description: "Do a victory pose with another person and capture it.", points: 10, emoji: "🏆" },
        { id: 108, title: "Paper Airplane",           description: "Make a paper airplane with someone and take a photo.", points: 15, emoji: "🛩️" },
        { id: 109, title: "Funny Glasses",            description: "Swap glasses with someone and snap a photo.", points: 10, emoji: "🤓" },
        { id: 110, title: "Pet High-Five",            description: "Give a high-five to a pet (with permission) and take a photo.", points: 15, emoji: "🐾" },

        { id: 111, title: "Team Pyramid",             description: "Make a human pyramid with 3+ people and snap it.", points: 20, emoji: "🔺" },
        { id: 112, title: "Cooking Together",         description: "Cook or prepare food with someone and take a photo.", points: 15, emoji: "🍳" },
        { id: 113, title: "Shadow Art",               description: "Make funny shadow shapes with a friend and snap it.", points: 15, emoji: "🌑" },
        { id: 114, title: "Cart Ride",                description: "Push someone in a shopping cart (safely) and take a photo.", points: 20, emoji: "🛒" },
        { id: 115, title: "Sports Buddy",             description: "Play a quick sport or game with someone and capture it.", points: 20, emoji: "⚽" },
        { id: 116, title: "Food Share",               description: "Share a bite of your food with someone and snap a photo.", points: 10, emoji: "🍕" },
        { id: 117, title: "Guess the Age",            description: "Guess someone’s age, then take a photo together.", points: 10, emoji: "🎂" },
        { id: 118, title: "Sunglasses Swap",          description: "Swap sunglasses with someone and snap a photo.", points: 10, emoji: "🕶️" },
        { id: 119, title: "Hand Heart",               description: "Make a heart with your hands together with someone.", points: 10, emoji: "❤️" },
        { id: 120, title: "Peace Chain",              description: "Make a chain of peace signs with 3+ people.", points: 15, emoji: "✌️" },

        { id: 121, title: "Water Toast",              description: "Clink water bottles with someone and snap it.", points: 5, emoji: "💧" },
        { id: 122, title: "Stretch Partner",          description: "Stretch with a friend and take a picture mid-stretch.", points: 10, emoji: "🤸" },
        { id: 123, title: "Fruit Together",           description: "Eat a fruit with someone and capture the moment.", points: 10, emoji: "🍎" },
        { id: 124, title: "Healthy Snack Swap",       description: "Swap snacks with someone and snap a photo.", points: 10, emoji: "🥒" },
        { id: 125, title: "Nature Walk",              description: "Take a walk in nature and snap a photo of the view.", points: 10, emoji: "🌳" },
        { id: 126, title: "Breathing Pause",          description: "Record a 5-second video of deep breathing outdoors.", points: 5, emoji: "🌬️" },
        { id: 127, title: "Stairs Over Elevator",     description: "Take a photo of yourself choosing stairs instead of elevator.", points: 10, emoji: "🪜" },
        { id: 128, title: "Water Bottle Refill",      description: "Refill your water bottle and take a picture.", points: 5, emoji: "🚰" },
        { id: 129, title: "Healthy Breakfast",        description: "Take a photo of your healthy breakfast today.", points: 10, emoji: "🥣" },
        { id: 130, title: "Evening Walk",             description: "Go for an evening walk and snap a photo of the sunset.", points: 10, emoji: "🌇" },

        { id: 131, title: "Victory Jump",             description: "Jump with a friend and take a mid-air photo.", points: 15, emoji: "🕴️" },
        { id: 132, title: "Team Thumbs-Up",           description: "Take a group selfie where everyone shows thumbs up.", points: 10, emoji: "👍" },
        { id: 133, title: "Funny Dance",              description: "Record a short video doing a funny dance with someone.", points: 15, emoji: "💃" },
        { id: 134, title: "Emoji Face",               description: "Take a selfie imitating your favorite emoji face.", points: 10, emoji: "😀" },
        { id: 135, title: "Coffee Queue Selfie",      description: "Take a selfie with people waiting in line at a café.", points: 10, emoji: "☕" },
        { id: 136, title: "Team Wave",                description: "Get at least 4 people to wave in a photo or video.", points: 15, emoji: "👋" },
        { id: 137, title: "Funny Hat",                description: "Wear a funny hat with someone and snap a photo.", points: 10, emoji: "🎩" },
        { id: 138, title: "Mirror Twins",             description: "Find someone dressed similar and pose as twins.", points: 15, emoji: "👯" },
        { id: 139, title: "Happy Stranger",           description: "Make a stranger laugh and snap a photo together.", points: 20, emoji: "😄" },
        { id: 140, title: "Superpower Pose",          description: "Pose like superheroes with 2+ people and take a picture.", points: 20, emoji: "🦸" },

        { id: 141, title: "Library Photo",            description: "Take a photo reading a book in a library or bookstore.", points: 10, emoji: "📚" },
        { id: 142, title: "Healthy Drink",            description: "Show a photo of you drinking tea, juice, or water.", points: 5, emoji: "🥤" },
        { id: 143, title: "Morning Stretch",          description: "Do a morning stretch and snap a photo of it.", points: 10, emoji: "🧘" },
        { id: 144, title: "Running Buddy",            description: "Go for a run or jog with someone and snap a photo.", points: 20, emoji: "🏃" },
        { id: 145, title: "Nature Spot",              description: "Find a nice nature spot and take a photo there.", points: 10, emoji: "🌿" },
        { id: 146, title: "Steps Counter",            description: "Take a screenshot showing your step count today.", points: 10, emoji: "📱" },
        { id: 147, title: "Evening Relax",            description: "Show how you relax in the evening with a photo.", points: 10, emoji: "🛋️" },
        { id: 148, title: "Good Morning Selfie",      description: "Take a selfie first thing in the morning.", points: 5, emoji: "🌞" },
        { id: 149, title: "Team Hug",                 description: "Take a group photo where everyone hugs each other.", points: 20, emoji: "🤗" },
        { id: 150, title: "Final Day Celebration",    description: "Celebrate completing challenges with a fun group selfie.", points: 20, emoji: "🎉" }
      ]

    ]


  // ...add the rest of the "normal" list here...
];

/** Testing United Conference list */
export const CONF_CHALLENGES: Challenge[] = [
 { id: 1,  title: "Take a photo of your desk",                description: "Snap your current testing workstation.", points: 10, emoji: "💻" },
  { id: 2,  title: "Take a photo of your pet tester",          description: "Show your pet ‘helping’ you test.", points: 10, emoji: "🐾" },
  { id: 3,  title: "Capture a real-world UI/UX bug",           description: "Find a funny bug in the wild and snap it.", points: 15, emoji: "🐞" },
  { id: 4,  title: "Take a selfie with your top tool",         description: "Pose with the testing tool you use most.", points: 10, emoji: "🧪" },
  { id: 5,  title: "Show your coffee/tea setup",               description: "Share your go-to caffeine station.", points: 5,  emoji: "☕" },
  { id: 6,  title: "Show a testing book you’re reading",       description: "Post the book that’s on your desk now.", points: 10, emoji: "📚" },
  { id: 7,  title: "Find a funny AI error (screenshot)",       description: "Grab a screenshot of an AI fail.", points: 15, emoji: "🤖" },
  { id: 8,  title: "Snap your conference alarm",               description: "Photo of your alarm set for the event.", points: 5,  emoji: "⏰" },
  { id: 9,  title: "Share something that works perfectly",     description: "Post a thing that sparks joy by working.", points: 10, emoji: "✨" },
  { id: 10, title: "Post a networking selfie",                 description: "Selfie to find a conference buddy.", points: 10, emoji: "🤝" },
  { id: 11, title: "Show tickets or route map",                description: "Photo of your travel plan to the event.", points: 10, emoji: "🗺️" },
  { id: 12, title: "Record a hello video",                     description: "Say hi to the community in a short clip.", points: 15, emoji: "🎥" },
  { id: 13, title: "Post your morning stand-up selfie",        description: "Share that just-woke-up sprint face.", points: 10, emoji: "🥱" },
  { id: 14, title: "Share your travel prep",                   description: "Suitcase, passport, gear—show it off.", points: 10, emoji: "🧳" },
  { id: 15, title: "Snap a bug-themed item",                   description: "Toy, shirt, sticker, meme—your choice.", points: 10, emoji: "🐞" },
  { id: 16, title: "Show your messy desk",                     description: "AKA the ‘bug production environment’.", points: 10, emoji: "🌀" },
  { id: 17, title: "Take a ready-to-board selfie",             description: "Plane, train, or bus—capture the moment.", points: 10, emoji: "✈️" },
  { id: 18, title: "Doodle a conference bug (photo)",          description: "Draw a quick bug and post a pic.", points: 15, emoji: "✏️" },
  { id: 19, title: "Show your testing mascot",                 description: "Plush, sticker, doodle—introduce them.", points: 10, emoji: "🧸" },
  { id: 20, title: "Take a coffee selfie",                     description: "You + coffee = productivity.", points: 5,  emoji: "☕️" },
  { id: 21, title: "Share a real-life ‘bug’",                  description: "Pretend-found glitch (broken sign, odd UI).", points: 15, emoji: "🔍" },
  { id: 22, title: "Strike a TU victory pose",                 description: "Show you’re ready for Testing United!", points: 10, emoji: "💪" },
  { id: 23, title: "Show outfit or conference swag",           description: "Today’s look or favorite swag item.", points: 10, emoji: "👕" },
  { id: 24, title: "Generate your QA superhero (AI)",          description: "Create your superhero alter ego.", points: 20, emoji: "🦸" },
  { id: 25, title: "Create a testing meme",                    description: "Make us laugh with a testing meme.", points: 15, emoji: "😂" },
  { id: 26, title: "Show a side project",                      description: "Photo of a build you’re tinkering with.", points: 10, emoji: "🧩" },
  { id: 27, title: "Illustrate a testing term (photo)",        description: "A funny pic that explains a concept.", points: 15, emoji: "🗣️" },
  { id: 28, title: "Take a packing photo",                     description: "Share your bag-packing moment.", points: 5,  emoji: "🧳" },
  { id: 29, title: "Share your team photo",                    description: "Your conference crew together.", points: 10, emoji: "👥" },
  { id: 30, title: "Show your keyboard setup",                 description: "Post your trusty keys.", points: 5,  emoji: "⌨️" },
  { id: 31, title: "Share a podcast moment",                   description: "Photo of you listening to a testing pod.", points: 10, emoji: "🎧" },
  { id: 32, title: "Share your coding/testing playlist",       description: "Screenshot your focus tracks.", points: 10, emoji: "🎶" },
  { id: 33, title: "Share a favorite testing quote",           description: "Photo or screenshot of the quote.", points: 10, emoji: "📝" },
  { id: 34, title: "Show your testing snacks",                 description: "Fuel for long sessions.", points: 5,  emoji: "🍫" },
  { id: 35, title: "Show an unsung tool/process",              description: "Helpful but unnoticed? Spotlight it.", points: 15, emoji: "🛠️" },
  { id: 36, title: "Record your learning goals (video)",       description: "What do you hope to learn here?", points: 15, emoji: "🎯" },
  { id: 37, title: "Make a ‘days left’ photo",                 description: "Creative way to show the countdown.", points: 10, emoji: "📅" },
  { id: 38, title: "Record how you use AI (video)",            description: "Quick clip of AI in your workflow.", points: 20, emoji: "🤖" },
  { id: 39, title: "Share a ‘Wait, what?’ bug",                description: "A bug that truly puzzled you.", points: 15, emoji: "🤔" },
  { id: 40, title: "Show your bag essentials",                 description: "A few must-have items for the day.", points: 10, emoji: "🎒" },
  { id: 41, title: "Share a testing hero read",                description: "Book or article by a testing hero.", points: 10, emoji: "📖" },
  { id: 42, title: "Take another boarding selfie",             description: "New angle or next leg of travel.", points: 10, emoji: "🛫" },
  { id: 43, title: "Selfie with your AI tester twin",          description: "You + your AI-generated version.", points: 20, emoji: "🤳" },
  { id: 44, title: "Design a new TU logo (AI)",                description: "Generate and share a fresh logo idea.", points: 20, emoji: "🎨" },
  { id: 45, title: "Show Milan in 3025 (AI)",                  description: "Imagine future Milan with AI.", points: 20, emoji: "🚀" },
  { id: 46, title: "Post your ‘Landed in Milan’ photo",        description: "First snap after touchdown.", points: 10, emoji: "🛬" },
  { id: 47, title: "Create an AI travel buddy",                description: "Generate a companion for the trip.", points: 15, emoji: "🧑‍🤝‍🧑" },
  { id: 48, title: "Take a photo of a top session",            description: "Show the talk you’re most excited about.", points: 10, emoji: "🗓️" }
];

export const todayKey = () => new Date().toDateString();

export const storageKeys = (variantKey: 'main' | 'conf') => ({
  current: (d: string) => `current-challenge-${variantKey}-${d}`,
  completed: (d: string) => `challenge-completed-${variantKey}-${d}`,
});

export function pickInitialChallenge(list: Challenge[], variantKey: 'main' | 'conf'): Challenge {
  const today = todayKey();
  const { current } = storageKeys(variantKey);
  const savedId = localStorage.getItem(current(today));
  if (savedId) {
    const found = list.find((c) => c.id === Number(savedId));
    if (found) return found;
  }
  const idx = new Date().getDate() % list.length;
  const chosen = list[idx];
  localStorage.setItem(current(today), String(chosen.id));
  return chosen;
}

export function pickNextChallenge(list: Challenge[], prevId: number): Challenge {
  const idx = Math.max(0, list.findIndex((c) => c.id === prevId));
  return list[(idx + 1) % list.length];
}