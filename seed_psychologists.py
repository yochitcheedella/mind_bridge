import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.psychologist import Psychologist

SQLALCHEMY_DATABASE_URL = "sqlite:///./mindbridge.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

psychologists_data = [
    {
        "name": "Sahithi Challa",
        "specialization": "Wellness Counsellor",
        "institution": "Vishnu School",
        "experience": "1 Year",
        "quote": "A decision doesn't define you. Your commitment to it does. ♡",
        "pillars": "Empathetic • Curious • Practical tools",
        "focus_areas": "Anxiety & overthinking; Stress & burnout; Self-esteem & confidence; Relationship & family concerns; Emotional ups & downs; Life transitions & uncertainty; Goal setting & motivation; Self-discovery & personal growth; Coping with difficult emotions; Building healthier habits & boundaries",
        "message_to_students": "You don't have to carry every burden alone. Speaking up isn't a sign of weakness; it's the first step toward healing. Small conversations today can prevent bigger struggles tomorrow.",
        "fun_facts": "I'm a Counselling Psychologist with a background in Forensic Psychology... I can be a total nerd about psychology... My comfort combo? Books and biryani. Always... My counselling space is a judgment-free zone... You'll probably catch me saying, 'Let's figure it out together.' ... Whether you're stressed, confused, overthinking, celebrating a win, or just need someone to listen, my door is always open. FUN FACT: I can probably recommend you a psychology book, a comfort movie, or a biryani place depending on what kind of day you're having.",
        "avatar_url": "/logo.png"
    },
    {
        "name": "Navya Sri",
        "specialization": "Wellness Counsellor",
        "institution": "B.V. Raju College",
        "experience": "3 Years",
        "quote": "Try, even if you fail, atleast you'll know what you can do differently next time ♡",
        "pillars": "Empathetic • Non-Judgemental • Supportive • Solution-Focused",
        "focus_areas": "Relationship & family concerns; Academic stress & pressure; Time management & procrastination; Emotional struggles & self doubt; Adjustment & life transitions; Crisis situations & emotional support; Self awareness & confidence building",
        "message_to_students": "It's okay to be different. You don't have to think, feel or choose the same as everyone else. Respect others' choices, express your own thoughts, and stay open to new perspectives. Sometimes, seeing things differently can help us understand ourselves and others a little better.",
        "fun_facts": "I genuinely enjoy a good conversation. I can easily get lost in nature's beauty and calm. Pets & little humans are my instant mood-lifters. I believe in the little things - a meaningful conversation, a small step, avoid laugh or simply being heard.",
        "avatar_url": "/logo.png"
    },
    {
        "name": "Bantu Anumitha",
        "specialization": "Wellness Counsellor",
        "institution": "Smt. B. Seetha Polytechnic College",
        "experience": "1 Year",
        "quote": "Healing isn't changing who you are; it's uncovering who you've always been ♡",
        "pillars": "Empathetic • Non-Judgemental • Strength-Based • Confidential",
        "focus_areas": "Adjustment to life changes; Overthinking and Procrastination; Career confusion and Decision Making; Stress and Time Management; Loneliness and Emotional Distress; Interpersonal and Relationship concerns; Emotional Regulation",
        "message_to_students": "You don't have to be perfect to be worthy, you are enough, even while you're growing. Asking for help doesn't mean you are weak, it means you are choosing to heal in more healthier way and you don't have to do it all alone.",
        "fun_facts": "I believe empathy is foundation of healing. I enjoy reading about psychology, dreams and human behavior. I believe progress should be celebrated, no matter how small. I think every conversation has the power to make the other person feel a little less alone. No, I can't read minds -but I do love understanding people.",
        "avatar_url": "/logo.png"
    },
    {
        "name": "Angel Benny",
        "specialization": "Wellness Counselor",
        "institution": "VDC (Vishnu Dental College)",
        "experience": "4+ Years",
        "quote": "Making space for the overthinking, the chaos and the \"I'm fine\" that definitely isn't fine. Making space for all of it and maybe even make sense of it together. ♡",
        "pillars": "Confidential • Compassionate • Non judgemental • Patient",
        "focus_areas": "Anxiety & overthinking; Academic stress & burnout; Self-esteem & confidence; Interpersonal concerns; Emotional regulation; Goal setting & motivation; Building healthy habits; Grief & loss; Exam anxiety; Family concerns; Time management",
        "message_to_students": "I hope that every student knows that no problem is too small to ask for help. There is a place where you can be heard without judgement, seen with compassion and accepted as they are.",
        "fun_facts": "Dogs > Cats > Everything else. (No further questions.) Always one book away from disappearing into a world of wizards or serial killers. There's no in between. Unpopular opinion: I'd pick water over coffee or tea any day. I can survive an entire conversation using movie quotes, memes, and dramatic reactions. Not a morning person. If you see me cheerful before 9 a.m., please check if it's actually me and if sleep were an Olympic sport i'd atleast make it to the finals. If you cant get my attention there is a 99.9% chance I'm wearing earbuds.",
        "avatar_url": "/logo.png"
    },
    {
        "name": "Akshitha Selvaraj",
        "specialization": "Wellness Counsellor",
        "institution": "Sri Vishnu College of Pharmacy",
        "experience": "1 Year",
        "quote": "Every conversation is a step toward healing, growth, and self-discovery ♡",
        "pillars": "Safe • Non-judgemental • Collaborative • Confidential",
        "focus_areas": "Interpersonal Issues; Exam- related Concerns and Academic stress; Depression and negative thinking; Stress and Overthinking; Time management; Personal growth and confidence building",
        "message_to_students": "It's ok to ask for support, even when you simply need someone to listen. Seeking help is a sign of strength. It's okay to make mistakes, ask for help, take breaks, and grow at your own pace-every step forward matters",
        "fun_facts": "I enjoy creating interactive mental health awareness programs and wellness initiatives for students. I believe that small, consistent changes can make a big difference in mental well-being. I value kindness, empathy, and lifelong learning. I love coffee and good music. I'm a good listener and genuinely enjoy getting to know people's stories. I enjoy creating spaces where people feel safe to talk, laugh, and learn. I believe progress is more important than perfection.",
        "avatar_url": "/logo.png"
    },
    {
        "name": "Devika Babu",
        "specialization": "Wellness Counsellor",
        "institution": "Vishnu Women's University",
        "experience": "3.5+ Years",
        "quote": "Creating a space where you can be yourself and talk about the things that really matter to you ♡",
        "pillars": "Ethical • Compassionate • Empowering • Goal-oriented",
        "focus_areas": "Stress management and trauma related concerns; Depression, anxiety and emotional well-being; Relationship and interpersonal difficulties; Academic and career clarity",
        "message_to_students": "The world is scary sometimes. You don't have to face it alone.",
        "fun_facts": "My brain is basically a storage unit for random facts. If there's a conspiracy theory, I'm already down that rabbit hole. If I'm quiet, I'm probably into a good book or series. If there's cold coffee involved, I'm in. Rainy days >>> Sunny days. 'Me time' is very important to me.",
        "avatar_url": "/logo.png"
    },
    {
        "name": "Ram Prudhvi Teja",
        "specialization": "Senior Wellness Counsellor",
        "institution": "VIT (Vishnu Institute of Technology)",
        "experience": "7+ Years",
        "quote": "The best way to predict your future is to create it—not from the influences of your past experiences, but through the power of your imagination. ♡",
        "pillars": "Non judgemental • Evidence based • Solution based • Empathetic",
        "focus_areas": "Stress, anxiety, and overthinking; Depression and emotional well-being; Academic stress and exam anxiety; Self-esteem and confidence building; Emotional regulation and anger management; Time management and procrastination; Crisis intervention and psychological first aid; Building resilience, acceptance mindfulness, and healthy coping skills",
        "message_to_students": "Seeking help is not a sign of weakness—it is a sign of courage. You don't have to carry every burden or suffer alone in silence. Asking for support isn't giving up, it's choosing growth over struggle and hope over fear.",
        "fun_facts": "Outside the counselling room, you'll often find me reading psychology books and novels, travelling, and exploring new places and cultures. I enjoy playing cricket, it keeps me active, energized. I love trying different cuisines and discovering new food experiences wherever I travel. I believe life is a journey of continuous learning, and I'm always curious to explore new ideas, perspectives, and experiences.",
        "avatar_url": "/logo.png"
    }
]

def seed_db():
    db = SessionLocal()
    try:
        for p_data in psychologists_data:
            existing = db.query(Psychologist).filter(Psychologist.name == p_data["name"]).first()
            if existing:
                for key, value in p_data.items():
                    setattr(existing, key, value)
            else:
                new_psych = Psychologist(**p_data)
                db.add(new_psych)
        db.commit()
        print("Successfully seeded psychologists data!")
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
