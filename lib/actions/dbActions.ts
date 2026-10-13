// Re-export collection actions explicitly
export {
  getPackagesAction,
  getPackageByIdAction,
  createPackageAction,
  updatePackageAction,
  deletePackageAction,
  type PackageItem,
} from "./packages";

export {
  getSlotsAction,
  createSlotAction,
  updateSlotStatusAction,
  deleteSlotAction,
  type SlotItem,
} from "./slots";

export {
  createBookingAction,
  getBookingsAction,
  type BookingItem,
} from "./bookings";

export {
  getAdminStatsAction,
  type AdminStats,
} from "./stats";
