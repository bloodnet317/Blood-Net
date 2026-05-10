import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  bn: {
    translation: {
      "nav": {
        "home": "হোম",
        "find": "খুঁজুন",
        "latest": "সর্বশেষ",
        "about": "আমাদের সম্পর্কে",
        "profile": "প্রোফাইল",
        "login": "লগইন"
      },
      "home": {
        "title": "ব্লাডনেট",
        "find_donors": "আপনার এলাকায় রক্তদাতা খুঁজুন",
        "target": "আমাদের লক্ষ্য",
        "join_donor": "রক্তদাতা হিসেবে যুক্ত হন",
        "join_button": "রক্তদাতা হিসেবে যোগ দিন",
        "sponsor": "স্পন্সর"
      },
      "find": {
        "search_placeholder": "নাম, স্থান বা মোবাইল নম্বর দিয়ে খুঁজুন...",
        "blood_group": "রক্তের গ্রুপ",
        "location": "এলাকা খুঁজুন",
        "available_badge": "রক্তদানের জন্য প্রস্তুত",
        "verified": "ভেরিফাইড",
        "not_verified": "ভেরিফাইড নয়",
        "report": "রিপোর্ট করুন",
        "contact": "যোগাযোগ"
      },
      "latest": {
        "announcements": "আমাদের ঘোষণা",
        "share_thoughts": "আপনার চিন্তা শেয়ার করুন",
        "comments": "মন্তব্য",
        "reply": "উত্তর দিন"
      },
      "profile": {
        "verified": "ভেরিফাইড",
        "not_verified": "অ-ভেরিফাইড",
        "work": "কাজ",
        "add_work": "কাজ যোগ করুন",
        "donation_count": "রক্তদানের সংখ্যা",
        "last_donated": "সর্বশেষ রক্তদান",
        "available": "রক্তদানের জন্য প্রস্তুত",
        "joined": "যোগদানের তারিখ",
        "settings": "সেটিংস",
        "verify_account": "অ্যাকাউন্ট ভেরিফাই করুন",
        "share_profile": "প্রোফাইল শেয়ার করুন",
        "download_card": "কার্ড ডাউনলোড করুন"
      },
      "admin": {
        "title": "অ্যাডমিন প্যানেল",
        "verify_requests": "ভেরিফিকেশন অনুরোধ",
        "manage_users": "ব্যবহারকারী পরিচালনা",
        "write_blog": "ব্লগ লিখুন",
        "sponsors": "স্পন্সর",
        "ads": "প্যাড অ্যাড"
      },
      "common": {
        "verified": "ভেরিফাইড",
        "not_verified": "ভেরিফাইড নয়",
        "today": "আজ",
        "days": "দিন",
        "months": "মাস",
        "ago": "আগে",
        "password": "পাসওয়ার্ড",
        "login_google": "গুগল দিয়ে লগইন করুন",
        "male": "পুরুষ",
        "female": "মহিলা",
        "email": "আপনার ইমেইল",
        "thoughts": "আপনার চিন্তা...",
        "send": "পাঠান",
        "close": "বন্ধ করুন",
        "copy_link": "লিঙ্ক কপি করুন",
        "share_title": "ব্লাডনেট শেয়ার করুন",
        "ready": "রক্তদানের জন্য প্রস্তুত",
        "all": "সবগুলো",
        "searching": "খুঁজছি..."
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "find": "Find",
        "latest": "Latest",
        "about": "About Us",
        "profile": "Profile",
        "login": "Login"
      },
      "home": {
        "title": "Bloodnet",
        "find_donors": "Find Blood Donors in your area",
        "target": "Our Target",
        "join_donor": "Join as a Donor",
        "join_button": "Join as a donor",
        "sponsor": "Sponsor"
      },
      "find": {
        "search_placeholder": "Search anything by name, location, mobile...",
        "blood_group": "Blood Group",
        "location": "Search Location",
        "available_badge": "Available to donate",
        "verified": "Verified",
        "not_verified": "Not Verified",
        "report": "Report User",
        "contact": "Contact"
      },
      "latest": {
        "announcements": "Announcements From Us",
        "share_thoughts": "Share Your Thoughts",
        "comments": "Comments",
        "reply": "Reply"
      },
      "profile": {
        "verified": "Verified",
        "not_verified": "not_verified",
        "work": "Work",
        "add_work": "Add Work",
        "donation_count": "Donation Count",
        "last_donated": "Last Donated",
        "available": "Available for Donation",
        "joined": "Joined In",
        "settings": "Settings",
        "verify_account": "Verify My Account",
        "share_profile": "Share My Profile",
        "download_card": "Download Card"
      },
      "admin": {
        "title": "Admin Panel",
        "verify_requests": "Verification Requests",
        "manage_users": "Manage Users",
        "write_blog": "Write a Blog",
        "sponsors": "Sponsors",
        "ads": "Pushed Ads"
      },
      "common": {
        "verified": "Verified",
        "not_verified": "Not Verified",
        "today": "Today",
        "days": "days",
        "months": "months",
        "ago": "ago",
        "password": "Password",
        "login_google": "Continue with Google",
        "male": "Male",
        "female": "Female",
        "email": "Your Email",
        "thoughts": "Your Thoughts...",
        "send": "Send",
        "close": "Close",
        "copy_link": "Copy Link",
        "share_title": "Share Bloodnet",
        "ready": "Ready to Donate",
        "all": "All",
        "searching": "Searching..."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "bn", // Initial language Bengali
    fallbackLng: "bn",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
