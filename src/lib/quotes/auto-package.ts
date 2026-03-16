import type { Product } from "@/hooks/useProducts";

interface QuoteFormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  wantsAccommodation: boolean;
  wantsForfait: boolean;
  wantsClases: boolean;
  wantsEquipment: boolean;
}

interface PackageItem {
  productId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface Upsell {
  product: Product;
  reason: string;
}

function getNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function getDays(checkIn: string, checkOut: string): number {
  return getNights(checkIn, checkOut);
}

function findBestAccommodation(products: Product[], destination: string, pax: number): Product | null {
  const accommodations = products
    .filter((p) => p.category === "alojamiento" && p.destination === destination && p.isActive)
    .sort((a, b) => a.price - b.price);

  // Try to find one that fits the group size (rough match by name)
  if (pax <= 2) {
    return accommodations.find((p) => p.name.includes("2 pax")) || accommodations[0] || null;
  }
  return accommodations.find((p) => p.name.includes("4 pax")) || accommodations[0] || null;
}

export function autoGeneratePackage(
  formData: QuoteFormData,
  products: Product[]
): { items: PackageItem[]; upsells: Upsell[] } {
  const items: PackageItem[] = [];
  const upsells: Upsell[] = [];
  const nights = getNights(formData.checkIn, formData.checkOut);
  const days = getDays(formData.checkIn, formData.checkOut);
  const totalPax = formData.adults + formData.children;

  // 1. Accommodation
  if (formData.wantsAccommodation) {
    const accommodation = findBestAccommodation(products, formData.destination, totalPax);
    if (accommodation) {
      const qty = totalPax <= 2 ? 1 : Math.ceil(totalPax / 4);
      items.push({
        productId: accommodation.id,
        name: accommodation.name,
        description: accommodation.description,
        quantity: qty * nights,
        unitPrice: accommodation.price,
        discount: 0,
        totalPrice: accommodation.price * qty * nights,
      });
    }
  }

  // 2. Forfaits
  if (formData.wantsForfait) {
    const adultForfait = products.find(
      (p) => p.category === "forfait" && p.destination === formData.destination && p.name.includes("Adulto") && p.isActive
    );
    if (adultForfait && formData.adults > 0) {
      const qty = formData.adults * days;
      items.push({
        productId: adultForfait.id,
        name: adultForfait.name,
        description: adultForfait.description,
        quantity: qty,
        unitPrice: adultForfait.price,
        discount: 0,
        totalPrice: adultForfait.price * qty,
      });
    }

    if (formData.children > 0) {
      const childForfait = products.find(
        (p) => p.category === "forfait" && p.destination === formData.destination && p.name.includes("Infantil") && p.isActive
      );
      if (childForfait) {
        const qty = formData.children * days;
        items.push({
          productId: childForfait.id,
          name: childForfait.name,
          description: childForfait.description,
          quantity: qty,
          unitPrice: childForfait.price,
          discount: 0,
          totalPrice: childForfait.price * qty,
        });
      }
    }
  }

  // 3. Classes
  if (formData.wantsClases) {
    const cursilloType = days >= 5 ? "5 días" : "3 días";
    if (formData.adults > 0) {
      const cursillo = products.find(
        (p) => p.category === "cursillo" && p.name.includes("Adulto") && p.name.includes(cursilloType) && p.isActive
      );
      if (cursillo) {
        items.push({
          productId: cursillo.id,
          name: cursillo.name,
          description: cursillo.description,
          quantity: formData.adults,
          unitPrice: cursillo.price,
          discount: 0,
          totalPrice: cursillo.price * formData.adults,
        });
      }
    }
    if (formData.children > 0) {
      const cursillo = products.find(
        (p) => p.category === "cursillo" && p.name.includes("Infantil") && p.name.includes(cursilloType) && p.isActive
      );
      if (cursillo) {
        items.push({
          productId: cursillo.id,
          name: cursillo.name,
          description: cursillo.description,
          quantity: formData.children,
          unitPrice: cursillo.price,
          discount: 0,
          totalPrice: cursillo.price * formData.children,
        });
      }
    }
  }

  // 4. Equipment Rental
  if (formData.wantsEquipment) {
    if (formData.adults > 0) {
      const pack = products.find(
        (p) => p.category === "alquiler" && p.name.includes("Esquí Adulto") && p.isActive
      );
      if (pack) {
        const qty = formData.adults * days;
        items.push({
          productId: pack.id,
          name: pack.name,
          description: pack.description,
          quantity: qty,
          unitPrice: pack.price,
          discount: 0,
          totalPrice: pack.price * qty,
        });
      }
    }
    if (formData.children > 0) {
      const pack = products.find(
        (p) => p.category === "alquiler" && p.name.includes("Esquí Infantil") && p.isActive
      );
      if (pack) {
        const qty = formData.children * days;
        items.push({
          productId: pack.id,
          name: pack.name,
          description: pack.description,
          quantity: qty,
          unitPrice: pack.price,
          discount: 0,
          totalPrice: pack.price * qty,
        });
      }
    }

    // Add helmets for children
    if (formData.children > 0) {
      const casco = products.find(
        (p) => p.category === "alquiler" && p.name === "Casco" && p.isActive
      );
      if (casco) {
        const qty = formData.children * days;
        items.push({
          productId: casco.id,
          name: casco.name,
          description: casco.description,
          quantity: qty,
          unitPrice: casco.price,
          discount: 0,
          totalPrice: casco.price * qty,
        });
      }
    }
  }

  // 5. Suggest upsells
  const apresSkiProducts = products.filter(
    (p) => p.category === "apres_ski" && p.isActive
  );
  for (const product of apresSkiProducts) {
    upsells.push({
      product,
      reason: "Actividad complementaria popular",
    });
  }

  return { items, upsells };
}

export type { PackageItem, Upsell, QuoteFormData };
