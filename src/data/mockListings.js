
// M3 - Seller Listings Mock Data

export const CONDITIONS = [
  "New",
  "Like new",
  "Used - good",
  "Used - fair"
];

export const mockListings = [
  {
    id: "l-1",
    ownerId: "u-org-1",
    name: "Desktop Computers",
    categoryId: "cat-1",
    type: "donation",
    price: null,
    quantity: 5,
    condition: "Used - good",
    location: "Dammam",
    description: "Used desktop computers in working condition.",
    images: [],
    status: "available",
    createdAt: "2026-10-02"
  },
  {
    id: "l-2",
    ownerId: "u-org-1",
    name: "Office Chairs",
    categoryId: "cat-2",
    type: "sale",
    price: 75,
    quantity: 12,
    condition: "Used - good",
    location: "Dammam",
    description: "Office chairs with adjustable height.",
    images: [],
    status: "available",
    createdAt: "2026-10-04"
  },
  {
    id: "l-3",
    ownerId: "u-org-3",
    name: "Wood Panels",
    categoryId: "cat-3",
    type: "donation",
    price: null,
    quantity: 40,
    condition: "New",
    location: "Khobar",
    description: "Leftover wood panels from a finished project.",
    images: [],
    status: "available",
    createdAt: "2026-10-06"
  }
];
