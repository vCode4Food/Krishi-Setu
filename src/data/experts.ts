import type { Expert } from "@/types";
import { images } from "./images";

export const experts: Expert[] = [
  {
    id: "EXP-01",
    name: "Dr. Anjali Sharma",
    specialization: "Soil Science & Wheat Agronomy",
    experienceYears: 14,
    languages: ["Hindi", "Marathi", "English"],
    rating: 4.9,
    reviews: 412,
    modes: ["video", "audio", "chat"],
    availableToday: true,
    nextSlot: "10:30 AM",
    image: images.experts.drSharma,
    location: "ICAR, New Delhi",
    fee: 199,
  },
  {
    id: "EXP-02",
    name: "Dr. Vilas Deshmukh",
    specialization: "Cotton Pest Management",
    experienceYears: 21,
    languages: ["Marathi", "Hindi", "English"],
    rating: 4.8,
    reviews: 356,
    modes: ["video", "on-site"],
    availableToday: true,
    nextSlot: "12:00 PM",
    image: images.experts.drDeshmukh,
    location: "VNMKV Parbhani",
    fee: 249,
  },
  {
    id: "EXP-03",
    name: "Prof. Ramesh Reddy",
    specialization: "Water Management & Irrigation",
    experienceYears: 17,
    languages: ["Telugu", "Hindi", "English", "Marathi"],
    rating: 4.7,
    reviews: 289,
    modes: ["video", "chat"],
    availableToday: false,
    nextSlot: "Tomorrow 09:00 AM",
    image: images.experts.profReddy,
    location: "IARI Regional Station",
    fee: 179,
  },
  {
    id: "EXP-04",
    name: "Dr. Simran Kaur",
    specialization: "Post-Harvest & Market Linkage",
    experienceYears: 11,
    languages: ["Punjabi", "Hindi", "English"],
    rating: 4.9,
    reviews: 198,
    modes: ["video", "audio", "chat"],
    availableToday: true,
    nextSlot: "03:30 PM",
    image: images.experts.drKaur,
    location: "PAU Ludhiana",
    fee: 219,
  },
];

export const consultationDates = ["Today", "Tomorrow", "Wed 17 Sep", "Thu 18 Sep", "Fri 19 Sep"];
export const consultationTimes = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM"];
export const consultationModeLabels: Record<string, string> = {
  video: "Video Consultation",
  audio: "Audio Consultation",
  chat: "Chat",
  "on-site": "On-site Visit",
};
