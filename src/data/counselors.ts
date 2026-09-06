export interface CounselorData {
  id: number;
  name: string;
  specialization: string;
  institution: string;
  experience: string;
  avatar_url: string;
  full_photo_url: string;
  quote: string;
  motto?: string;
  pillars: string[];
  focus_areas: string[];
  message_to_students: string;
  if_scary: string;
  fun_facts: string;
  languages: string;
  availability: string;
  is_online: boolean;
}

export const VISHNU_WELLNESS_CENTRE = {
  name: "Vishnu Wellness Centre",
  institution: "Sri Vishnu Educational Society",
  established: "2017",
  tagline: "Supporting Minds. Empowering Lives. ♡",
  vision: "To foster a campus community where every student feels supported, empowered, and equipped to thrive emotionally, personally, and academically.",
  mission: [
    "Provide accessible, ethical, and confidential psychological services.",
    "Promote mental health awareness, resilience, and emotional well-being.",
    "Encourage early intervention and reduce the stigma surrounding mental health.",
    "Create safe spaces that empower students to grow and flourish."
  ],
  pillars: ["Compassion", "Confidentiality", "Empathy", "Integrity", "Well-Being"],
  logo_url: "/vishnu_logo.png"
};

export const OFFICIAL_COUNSELORS: CounselorData[] = [
  {
    id: 1,
    name: "SAHITHI CHALLA",
    specialization: "Wellness Counsellor",
    institution: "Vishnu School",
    experience: "1 Year",
    avatar_url: "/counselors/sahithi_challa_head.jpg",
    full_photo_url: "/counselors/sahithi_challa_full.jpg",
    quote: "A decision doesn't define you. Your commitment to it does. ♡",
    motto: "Helping you untangle your thoughts with empathy, curiosity, and practical tools that actually work. ♡",
    pillars: ["Empathetic", "Curious", "Practical tools"],
    focus_areas: [
      "Anxiety & overthinking",
      "Stress & burnout",
      "Self-esteem & confidence",
      "Relationship & family concerns",
      "Emotional ups & downs",
      "Life transitions & uncertainty",
      "Goal setting & motivation",
      "Self-discovery & personal growth",
      "Coping with difficult emotions",
      "Building healthier habits & boundaries"
    ],
    message_to_students: "You don't have to carry every burden alone. Speaking up isn't a sign of weakness; it's the first step toward healing. Small conversations today can prevent bigger struggles tomorrow. ♡",
    if_scary: "Your feelings are valid. Your story matters. And you deserve a space where both are welcomed with care. ♡",
    fun_facts: "I'm a Counselling Psychologist with a background in Forensic Psychology (yes, crime documentaries are basically homework 🕵️). My comfort combo? Books and biryani. Always. You'll probably catch me saying, 'Let's figure it out together.' I can be a total nerd about psychology, but I promise I won't make it feel like a lecture. My counselling space is a judgment-free zone; you don't have to have the 'right words' to talk to me. Whether you're stressed, confused, overthinking, celebrating a win, or just need someone to listen, my door is always open. FUN FACT: I can probably recommend you a psychology book, a comfort movie, or a biryani place depending on what kind of day you're having. ♡",
    languages: "English, Telugu, Hindi",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  },
  {
    id: 2,
    name: "NAVYA SRI",
    specialization: "Wellness Counsellor",
    institution: "B.V. Raju College",
    experience: "3 Years",
    avatar_url: "/counselors/navya_sri_head.jpg",
    full_photo_url: "/counselors/navya_sri_full.jpg",
    quote: "Try, even if you fail, atleast you'll know what you can do differently next time ♡",
    motto: "I believe in slow and gradual change rather than quick fixes. Counselling, for me, is about understanding where you are, working at your pace, and finding small, practical ways to move forward. ♡",
    pillars: ["Empathetic", "Non-Judgemental", "Supportive", "Solution-Focused"],
    focus_areas: [
      "Relationship & family concerns",
      "Academic stress & pressure",
      "Time management & procrastination",
      "Emotional struggles & self doubt",
      "Adjustment & life transitions",
      "Crisis situations & emotional support",
      "Self awareness & confidence building"
    ],
    message_to_students: "It's okay to be different. You don't have to think, feel or choose the same as everyone else. Respect others' choices, express your own thoughts, and stay open to new perspectives. Sometimes, seeing things differently can help us understand ourselves and others a little better. ♡",
    if_scary: "You don't need to know what to say. Just take that first step and come for a conversation with someone who doesn't know your story yet but is genuinely interested in listening to it without any judgement. There's no need to have the 'right' words or a 'big enough' problem. Come as you are. ♡",
    fun_facts: "I genuinely enjoy a good conversation. I can easily get lost in nature's beauty and calm. Pets & little humans are my instant mood-lifters. I believe in the little things - a meaningful conversation, a small step, a good laugh or simply being heard. ♡",
    languages: "English, Telugu, Hindi",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  },
  {
    id: 3,
    name: "BANTU ANUMITHA",
    specialization: "Wellness Counsellor",
    institution: "Smt. B. Seetha Polytechnic College",
    experience: "1 Year",
    avatar_url: "/counselors/bantu_anumitha_head.jpg",
    full_photo_url: "/counselors/bantu_anumitha_full.jpg",
    quote: "Healing isn't changing who you are; it's uncovering who you've always been ♡",
    motto: "I believe every individual deserves to be heard without judgement. My role is not to tell you who to become, but to help you discover your strengths, build healthier coping skills through empathy, confidentiality and building resilience. ♡",
    pillars: ["Empathetic", "Non-Judgemental", "Strength-Based", "Confidential"],
    focus_areas: [
      "Adjustment to life changes",
      "Overthinking and Procrastination",
      "Career confusion and Decision Making",
      "Stress and Time Management",
      "Loneliness and Emotional Distress",
      "Interpersonal and Relationship concerns",
      "Emotional Regulation"
    ],
    message_to_students: "You don't have to be perfect to be worthy, you are enough, even while you're growing. Asking for help doesn't mean you are weak, it means you are choosing to heal in more healthier way and you don't have to do it all alone. ♡",
    if_scary: "Taking the first step is often the hardest but it will be the most meaningful. There is no pressure to share everything in the first session, we will go forward at your pace. Silence is welcomed and tears are okay, you don't have to pretend to be okay. ♡",
    fun_facts: "I believe empathy is foundation of healing. I enjoy reading about psychology, dreams and human behavior. I believe progress should be celebrated, no matter how small. I think every conversation has the power to make the other person feel a little less alone. No, I can't read minds - but I do love understanding people. ♡",
    languages: "English, Telugu, Hindi",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  },
  {
    id: 4,
    name: "ANGEL BENNY",
    specialization: "Wellness Counselor",
    institution: "VDC (Vishnu Dental College)",
    experience: "4+ Years",
    avatar_url: "/counselors/angel_benny_head.jpg",
    full_photo_url: "/counselors/angel_benny_full.jpg",
    quote: "Making space for the overthinking, the chaos and the 'I'm fine' that definitely isn't fine. Making space for all of it and maybe even make sense of it together. ♡",
    motto: "Helping you, one day at a time. ♡",
    pillars: ["Confidential", "Compassionate", "Non judgemental", "Patient"],
    focus_areas: [
      "Anxiety & overthinking",
      "Academic stress & burnout",
      "Self-esteem & confidence",
      "Interpersonal concerns",
      "Emotional regulation",
      "Goal setting & motivation",
      "Building healthy habits",
      "Grief & loss",
      "Exam anxiety",
      "Family concerns",
      "Time management"
    ],
    message_to_students: "I hope that every student knows that no problem is too small to ask for help. There is a place where you can be heard without judgement, seen with compassion and accepted as they are. ♡",
    if_scary: "Remember it isn't just for the hard days. It is also for the little wins, the big feelings, the chaos and everything in between, we've got room for it all. Your notes app, chatGPT and google have tried... now try us. ♡",
    fun_facts: "Dogs > Cats > Everything else. (No further questions.) Always one book away from disappearing into a world of wizards or serial killers. There's no in between. Unpopular opinion: I'd pick water over coffee or tea any day. I can survive an entire conversation using movie quotes, memes, and dramatic reactions. Not a morning person. If you see me cheerful before 9 a.m., please check if it's actually me and if sleep were an Olympic sport I'd atleast make it to the finals. If you can't get my attention there is a 99.9% chance I'm wearing earbuds. Let's take it one conversation at a time. You don't have to have it all figured out. You just have to begin. ♡",
    languages: "English, Hindi, Malayalam",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  },
  {
    id: 5,
    name: "AKSHITHA SELVARAJ",
    specialization: "Wellness Counsellor",
    institution: "Sri Vishnu College of Pharmacy",
    experience: "1 Year",
    avatar_url: "/counselors/akshitha_selvaraj_head.jpg",
    full_photo_url: "/counselors/akshitha_selvaraj_full.jpg",
    quote: "Every conversation is a step toward healing, growth, and self-discovery ♡",
    motto: "I believe in creating a safe, non-judgmental, and confidential space where students feel heard, understood, and supported. My approach is empathetic, collaborative, and focused on helping individuals build resilience, develop healthy coping strategies, and achieve emotional well-being. ♡",
    pillars: ["Safe", "Non-judgemental", "Collaborative", "Confidential"],
    focus_areas: [
      "Interpersonal Issues",
      "Exam-related Concerns and Academic stress",
      "Depression and negative thinking",
      "Stress and Overthinking",
      "Time management",
      "Personal growth and confidence building"
    ],
    message_to_students: "It's ok to ask for support, even when you simply need someone to listen. Seeking help is a sign of strength. It's okay to make mistakes, ask for help, take breaks, and grow at your own pace—every step forward matters. ♡",
    if_scary: "It's completely normal to feel nervous before your first session. Counseling is simply a conversation where you can be yourself without fear of judgment. You don't have to have the 'right words'. We'll figure things out together, one step at a time. ♡",
    fun_facts: "I enjoy creating interactive mental health awareness programs and wellness initiatives for students. I believe that small, consistent changes can make a big difference in mental well-being. I value kindness, empathy, and lifelong learning. I love coffee and good music. I'm a good listener and genuinely enjoy getting to know people's stories. I enjoy creating spaces where people feel safe to talk, laugh, and learn. I believe progress is more important than perfection. ♡",
    languages: "English, Tamil, Hindi, Telugu",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  },
  {
    id: 6,
    name: "DEVIKA BABU",
    specialization: "Wellness Counsellor",
    institution: "Vishnu Women's University",
    experience: "3.5+ Years",
    avatar_url: "/counselors/devika_babu_head.jpg",
    full_photo_url: "/counselors/devika_babu_full.jpg",
    quote: "Creating a space where you can be yourself and talk about the things that really matter to you ♡",
    motto: "It's okay if your journey looks different from someone else's. Progress is more important than perfection. ♡",
    pillars: ["Ethical", "Compassionate", "Empowering", "Goal-oriented"],
    focus_areas: [
      "Stress management and trauma related concerns",
      "Depression, anxiety and emotional well-being",
      "Relationship and interpersonal difficulties",
      "Academic and career clarity"
    ],
    message_to_students: "The world is scary sometimes. You don't have to face it alone. I'm not here to judge you but to support you. ♡",
    if_scary: "Creating a space where you can be yourself and talk about the things that really matter to you. I'm not here to judge you but to support you. ♡",
    fun_facts: "My brain is basically a storage unit for random facts. If there's a conspiracy theory, I'm already down that rabbit hole. If I'm quiet, I'm probably into a good book or series. If there's cold coffee involved, I'm in. Rainy days >>> Sunny days. 'Me time' is very important to me. ♡",
    languages: "English, Telugu, Hindi, Malayalam",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  },
  {
    id: 7,
    name: "RAM PRUDHVI TEJA",
    specialization: "Senior Wellness Counsellor",
    institution: "VIT (Vishnu Institute of Technology)",
    experience: "7+ Years",
    avatar_url: "/counselors/ram_prudhvi_teja_head.jpg",
    full_photo_url: "/counselors/ram_prudhvi_teja_full.jpg",
    quote: "The best way to predict your future is to create it—not from the influences of your past experiences, but through the power of your imagination. ♡",
    motto: "SUPPORTING MINDS. ENCOURAGING GROWTH. INSPIRING WELLNESS. ♡",
    pillars: ["Non judgemental", "Evidence based", "Solution based", "Empathetic"],
    focus_areas: [
      "Stress, anxiety, and overthinking",
      "Depression and emotional well-being",
      "Academic stress and exam anxiety",
      "Self-esteem and confidence building",
      "Emotional regulation and anger management",
      "Time management and procrastination",
      "Crisis intervention and psychological first aid",
      "Building resilience, acceptance mindfulness, and healthy coping skills"
    ],
    message_to_students: "Seeking help is not a sign of weakness—it is a sign of courage. You don't have to carry every burden or suffer alone in silence. Asking for support isn't giving up, it's choosing growth over struggle and hope over fear. ♡",
    if_scary: "Counselling is simply a safe conversation. There is no judgment, no pressure, and no expectation to have everything figured out. We will move at your pace, and everything you share will be treated with respect and confidentiality within professional and ethical guidelines. ♡",
    fun_facts: "Outside the counselling room, you'll often find me reading psychology books and novels, travelling, and exploring new places and cultures. I love trying different cuisines and discovering new food experiences wherever I travel. I enjoy playing cricket, it keeps me active, energized. I believe life is a journey of continuous learning, and I'm always curious to explore new ideas, perspectives, and experiences. ♡",
    languages: "English, Telugu, Hindi",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    is_online: true
  }
];
