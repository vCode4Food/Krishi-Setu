import type { Truck } from "@/types";

export const trucks: Truck[] = [
  {
    truckId: "TRK-101",
    rfid: "TRK-98312",
    registrationNumber: "MH-12-AB-4521",
    farmerId: "FRM-10482",
    farmerName: "Ramesh Patil",
    status: "registered",
    bookingId: "KS-PROC-2026-00482",
    crop: "Wheat",
  },
  {
    truckId: "TRK-102",
    rfid: "TRK-98231",
    registrationNumber: "MH-14-CD-8241",
    farmerId: "FRM-10231",
    farmerName: "Sunita Devi",
    status: "registered",
    bookingId: "KS-PROC-2026-00477",
    crop: "Onion",
  },
  {
    truckId: "TRK-103",
    rfid: "TRK-98418",
    registrationNumber: "MH-31-EF-1109",
    farmerId: "FRM-10776",
    farmerName: "Gurpreet Singh",
    status: "en-route",
    crop: "Wheat",
  },
  {
    truckId: "TRK-104",
    rfid: "TRK-98555",
    registrationNumber: "MH-27-GH-3301",
    farmerId: "FRM-10231",
    farmerName: "Sunita Devi",
    status: "registered",
    crop: "Tomato",
  },
  {
    truckId: "TRK-105",
    rfid: "TRK-98620",
    registrationNumber: "RJ-14-JK-7788",
    farmerId: "FRM-10776",
    farmerName: "Gurpreet Singh",
    status: "en-route",
    crop: "Rice",
  },
];

export const getTruckByRfid = (rfid: string) => trucks.find((t) => t.rfid === rfid);
export const getTruckByReg = (reg: string) =>
  trucks.find((t) => t.registrationNumber === reg);
